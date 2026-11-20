#!/usr/bin/env node
/**
 * Zero-dependency Chrome DevTools Protocol (CDP) Injector for Antigravity Desktop.
 * Requires Node.js >= 22 (built-in fetch & WebSocket) and Antigravity launched with:
 *   --remote-debugging-port=9000 --remote-allow-origins=*
 *
 * Persistence model:
 *   - A tiny background "sync" process keeps one CDP session per Antigravity window.
 *   - The page saves config/media through a `Runtime.addBinding` bridge
 *     -> written to user-data/config.json and user-data/media/*.txt.
 *   - Every injection boots the page with that saved state, so wallpaper, stickers,
 *     pets and deletions stay exactly as you left them after quitting/reopening the app.
 *   - The sync process exits on its own a few seconds after Antigravity quits.
 */
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const SELF_PATH = fileURLToPath(import.meta.url);
const __dirname = path.dirname(SELF_PATH);
const DIST_BUNDLE_PATH = path.join(__dirname, 'dist', 'antigravity-theme-injector.js');
const BUILD_SCRIPT_PATH = path.join(__dirname, 'scripts', 'build.mjs');

const USER_DATA_DIR = process.env.AGY_CT_USER_DATA_DIR
  ? path.resolve(process.env.AGY_CT_USER_DATA_DIR)
  : path.join(__dirname, 'user-data');
const USER_CONFIG_PATH = path.join(USER_DATA_DIR, 'config.json');
const USER_MEDIA_DIR = path.join(USER_DATA_DIR, 'media');
const DAEMON_PID_PATH = path.join(USER_DATA_DIR, 'sync-daemon.pid');
const DAEMON_STATUS_PATH = path.join(USER_DATA_DIR, 'sync-status.json');
const DAEMON_LOG_PATH = path.join(USER_DATA_DIR, 'sync-daemon.log');
const OPEN_SETTINGS_FLAG_PATH = path.join(USER_DATA_DIR, 'open-settings.flag');

const MEDIA_KEYS = ['wallpaper', 'pet', 'sticker'];

function isValidMediaKey(key) {
  return typeof key === 'string' && /^[a-z0-9_-]{1,80}$/i.test(key);
}
const BINDING_NAME = '__agyCtPersist';
const POLL_INTERVAL_MS = 2500;
const EXIT_AFTER_FAILED_POLLS = 4;
const OPEN_SETTINGS_SNIPPET = '\n;window.__AGY_CUSTOM_THEME__?.openSettings?.();\n';

const RESET_SCRIPT = `(() => {
  if (window.__AGY_CUSTOM_THEME__ && typeof window.__AGY_CUSTOM_THEME__.destroy === 'function') {
    window.__AGY_CUSTOM_THEME__.destroy();
    return { reset: true, hadInstance: true };
  }
  return { reset: true, hadInstance: false };
})();`;

function printHelp() {
  console.log(`
Antigravity Custom Theme — CDP Injector

Cách dùng:
  node inject.mjs [tùy chọn]

Tùy chọn:
  --port <số>        Cổng CDP của Antigravity (mặc định: 9000; tránh 9222 vì trình duyệt nội bộ dùng sẵn)
  --host <địa chỉ>   Host CDP (mặc định: 127.0.0.1)
  --title <chuỗi>    Chỉ tiêm vào cửa sổ có title hoặc URL chứa chuỗi này
  --build            Build lại dist/antigravity-theme-injector.js trước khi tiêm
  --open-settings    Tự mở bảng Custom theme ngay sau khi tiêm
  --launch           Tự mở Antigravity kèm cổng CDP 9000, chờ cửa sổ sẵn sàng rồi tiêm
  --app <tên/path>   Tên hoặc đường dẫn app dùng cho --launch (mặc định: Antigravity)
  --watch            Chạy đồng bộ ở foreground, tự rebuild và tiêm nóng lại khi sửa src/ hoặc assets/wallpapers/
  --reset            Dừng đồng bộ và gỡ sạch Custom theme khỏi cửa sổ đang mở
  --dry-run          Kiểm tra bundle và thông số CDP mà không kết nối tới app
  -h, --help         Hiện hướng dẫn này

Cấu hình (ảnh nền, sticker, pet, mục đã xoá...) được lưu bền vững tại:
  ${USER_CONFIG_PATH}

Khởi động Antigravity kèm cổng CDP 9000:
  macOS:   open -a Antigravity --args --remote-debugging-port=9000 "--remote-allow-origins=*"
  Windows: Start-Process "$env:LOCALAPPDATA\\\\Programs\\\\antigravity\\\\Antigravity.exe" -ArgumentList "--remote-debugging-port=9000","--remote-allow-origins=*"
  Linux:   antigravity --remote-debugging-port=9000 "--remote-allow-origins=*"
`.trim());
}

function parseCliArgs(argv) {
  const args = {
    host: '127.0.0.1',
    port: 9000,
    title: '',
    app: 'Antigravity',
    build: false,
    openSettings: false,
    launch: false,
    watch: false,
    reset: false,
    dryRun: false,
    help: false,
    syncDaemon: false,
    daemonWaitMs: 30000
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '-h' || token === '--help') {
      args.help = true;
    } else if (token === '--build') {
      args.build = true;
    } else if (token === '--open-settings') {
      args.openSettings = true;
    } else if (token === '--launch') {
      args.launch = true;
    } else if (token === '--watch') {
      args.watch = true;
    } else if (token === '--reset') {
      args.reset = true;
    } else if (token === '--dry-run') {
      args.dryRun = true;
    } else if (token === '--sync-daemon') {
      args.syncDaemon = true;
    } else if (token === '--daemon-wait') {
      const parsed = Number(argv[++i]);
      if (Number.isFinite(parsed) && parsed > 0) args.daemonWaitMs = parsed;
    } else if (token === '--host') {
      args.host = argv[++i] || args.host;
    } else if (token === '--app') {
      args.app = argv[++i] || args.app;
    } else if (token === '--port') {
      const parsed = Number(argv[++i]);
      if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error('Giá trị --port phải là số nguyên trong khoảng 1..65535.');
      }
      args.port = parsed;
    } else if (token === '--title') {
      args.title = argv[++i] || '';
    } else {
      throw new Error(`Tham số không hợp lệ: ${token}. Dùng --help để xem hướng dẫn.`);
    }
  }

  return args;
}

/* ------------------------------------------------------------------ */
/* Bundle & persisted user data                                        */
/* ------------------------------------------------------------------ */

function ensureBuiltBundle(forceRebuild = false) {
  if (forceRebuild || !fs.existsSync(DIST_BUNDLE_PATH)) {
    execFileSync(process.execPath, [BUILD_SCRIPT_PATH], { stdio: 'inherit' });
  }
  return fs.readFileSync(DIST_BUNDLE_PATH, 'utf8');
}

function ensureUserDataDirs() {
  fs.mkdirSync(USER_MEDIA_DIR, { recursive: true });
}

function writeFileAtomic(filePath, content) {
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readUserConfig() {
  const cfg = readJsonFile(USER_CONFIG_PATH);
  return cfg && typeof cfg === 'object' ? cfg : null;
}

function mediaFilePath(key) {
  return path.join(USER_MEDIA_DIR, `${key}.txt`);
}

function readUserMedia() {
  const media = {};
  ensureUserDataDirs();
  try {
    const entries = fs.readdirSync(USER_MEDIA_DIR);
    for (const entry of entries) {
      if (!entry.endsWith('.txt')) continue;
      const key = path.basename(entry, '.txt');
      try {
        const value = fs.readFileSync(path.join(USER_MEDIA_DIR, entry), 'utf8');
        if (value.startsWith('data:')) media[key] = value;
      } catch {
        // Not saved or unreadable
      }
    }
  } catch {
    // Media directory not yet created or unreadable
  }
  return media;
}

/** Strip embedded Base64 of permanently deleted wallpapers so they cost zero RAM. */
export function stripDeletedWallpapers(source, config) {
  const hidden = Array.isArray(config?.hiddenWallpapers) ? config.hiddenWallpapers : [];
  let out = source;
  for (const id of hidden) {
    if (typeof id !== 'string' || !/^[a-z0-9-]+$/i.test(id)) continue;
    const pattern = new RegExp(`(id:\\s*(['"])${id}\\2[^{}]*?embeddedDataUri:\\s*)(['"])data:[^'"]*\\3`);
    out = out.replace(pattern, '$1$3$3');
  }
  return out;
}

function buildPayload(bundleSource, { openSettings = false } = {}) {
  const config = readUserConfig();
  const media = readUserMedia();
  const boot = `window.__AGY_CT_BOOT__ = ${JSON.stringify({ config, media })};\n`;
  let source = boot + stripDeletedWallpapers(bundleSource, config);
  if (openSettings) source += OPEN_SETTINGS_SNIPPET;
  return source;
}

/** Handle a persistence message sent from the page binding. Returns message type. */
function persistFromPage(rawPayload) {
  let msg;
  try {
    msg = JSON.parse(rawPayload);
  } catch {
    return null;
  }
  if (!msg || typeof msg !== 'object') return null;
  ensureUserDataDirs();

  if ((msg.type === 'config' || msg.type === 'config-init') && msg.data && typeof msg.data === 'object') {
    const current = readUserConfig();
    if (msg.type === 'config-init' && current !== null) {
      return null; // Never overwrite existing persisted config during startup handshake
    }
    if (current && Number(current.__savedAt || 0) > Number(msg.data.__savedAt || 0)) {
      return null; // Stale snapshot from another window
    }
    writeFileAtomic(USER_CONFIG_PATH, JSON.stringify(msg.data, null, 2));
    return 'config';
  }
  if (msg.type === 'media' && isValidMediaKey(msg.key)) {
    if (typeof msg.dataUrl === 'string' && msg.dataUrl.startsWith('data:')) {
      writeFileAtomic(mediaFilePath(msg.key), msg.dataUrl);
    } else {
      fs.rmSync(mediaFilePath(msg.key), { force: true });
    }
    return 'media';
  }
  if (msg.type === 'media-clear') {
    try {
      const entries = fs.readdirSync(USER_MEDIA_DIR);
      for (const entry of entries) {
        if (entry.endsWith('.txt')) {
          fs.rmSync(path.join(USER_MEDIA_DIR, entry), { force: true });
        }
      }
    } catch {
      // ignore
    }
    return 'media';
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* CDP                                                                 */
/* ------------------------------------------------------------------ */

async function fetchDebugTargets({ host, port, titleFilter = '', timeoutMs = 4000 }) {
  const candidates = [`http://${host}:${port}/json/list`, `http://${host}:${port}/json`];
  let response = null;
  let usedEndpoint = candidates[0];

  for (const endpoint of candidates) {
    usedEndpoint = endpoint;
    try {
      response = await fetch(endpoint, { signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
      throw new Error(
        `Không kết nối được cổng CDP ${host}:${port} (${error.message}).\n` +
          `Hãy thoát hẳn Antigravity (Cmd+Q) rồi mở lại bằng Launcher hoặc lệnh:\n` +
          `  open -a Antigravity --args --remote-debugging-port=${port} "--remote-allow-origins=*"`
      );
    }
    if (response.ok || response.status !== 404) break;
  }

  if (!response || !response.ok) {
    const status = response ? response.status : 'unknown';
    const hint =
      port === 9222
        ? ' Cổng 9222 thường bị trình duyệt nội bộ giữ sẵn; hãy dùng --port 9000.'
        : ' Kiểm tra lại cờ --remote-debugging-port và --remote-allow-origins=*.';
    throw new Error(`CDP endpoint trả về HTTP ${status} tại ${usedEndpoint}.${hint}`);
  }

  const targets = await response.json();
  const filter = titleFilter.trim().toLowerCase();

  return targets.filter((target) => {
    if (target.type !== 'page' || !target.webSocketDebuggerUrl) return false;
    if (typeof target.url === 'string') {
      const lowerUrl = target.url.toLowerCase();
      if (
        lowerUrl.startsWith('devtools://') ||
        lowerUrl.startsWith('chrome://') ||
        lowerUrl.startsWith('edge://') ||
        lowerUrl.startsWith('chrome-extension://')
      ) {
        return false;
      }
    }
    if (!filter) return true;
    return `${target.title || ''} ${target.url || ''}`.toLowerCase().includes(filter);
  });
}

async function tryFetchDebugTargets(args, timeoutMs = 1200) {
  try {
    return await fetchDebugTargets({
      host: args.host,
      port: args.port,
      titleFilter: args.title,
      timeoutMs
    });
  } catch {
    return null;
  }
}

class CdpSession {
  #ws;
  #nextId = 1;
  #pending = new Map();
  #eventHandlers = new Set();
  #closeHandlers = new Set();
  closed = false;

  constructor(ws) {
    this.#ws = ws;
  }

  static connect(webSocketUrl, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(webSocketUrl);
      const session = new CdpSession(ws);

      const timer = setTimeout(() => {
        try {
          ws.close();
        } catch {
          // ignore
        }
        reject(new Error(`Quá thời gian kết nối WebSocket tới ${webSocketUrl}`));
      }, timeoutMs);

      ws.addEventListener('open', () => {
        clearTimeout(timer);
        resolve(session);
      });
      ws.addEventListener('error', (event) => {
        clearTimeout(timer);
        const msg = event?.message || 'WebSocket connection failed';
        session.#rejectAll(new Error(msg));
        reject(new Error(msg));
      });
      ws.addEventListener('close', () => {
        session.closed = true;
        session.#rejectAll(new Error('Kết nối CDP WebSocket đã đóng.'));
        for (const handler of session.#closeHandlers) {
          try {
            handler();
          } catch {
            // ignore
          }
        }
      });
      ws.addEventListener('message', (event) => {
        session.#handleMessage(event.data);
      });
    });
  }

  onEvent(handler) {
    this.#eventHandlers.add(handler);
  }

  onClose(handler) {
    this.#closeHandlers.add(handler);
  }

  #handleMessage(rawData) {
    let payload;
    try {
      payload = JSON.parse(typeof rawData === 'string' ? rawData : String(rawData));
    } catch {
      return;
    }
    if (payload.method) {
      for (const handler of this.#eventHandlers) {
        try {
          handler(payload.method, payload.params || {});
        } catch {
          // ignore handler errors
        }
      }
      return;
    }
    if (payload.id === undefined || !this.#pending.has(payload.id)) return;
    const { resolve, reject, timer } = this.#pending.get(payload.id);
    this.#pending.delete(payload.id);
    clearTimeout(timer);
    if (payload.error) {
      reject(new Error(`CDP error (${payload.error.code}): ${payload.error.message}`));
    } else {
      resolve(payload.result ?? {});
    }
  }

  #rejectAll(error) {
    for (const [id, entry] of this.#pending.entries()) {
      clearTimeout(entry.timer);
      entry.reject(error);
      this.#pending.delete(id);
    }
  }

  send(method, params = {}, timeoutMs = 30000) {
    if (this.#ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`WebSocket chưa sẵn sàng cho lệnh ${method}.`));
    }
    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error(`Lệnh CDP ${method} quá thời gian chờ (${timeoutMs}ms).`));
      }, timeoutMs);
      this.#pending.set(id, { resolve, reject, timer });
      this.#ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.#rejectAll(new Error('Phiên CDP đã đóng.'));
    try {
      this.#ws.close();
    } catch {
      // ignore
    }
  }
}

async function evaluateSource(session, source) {
  const evalResult = await session.send('Runtime.evaluate', {
    expression: source,
    returnByValue: true,
    awaitPromise: false
  });
  if (evalResult.exceptionDetails) {
    throw new Error(evalResult.exceptionDetails.text || 'Runtime evaluation failed');
  }
}

async function waitForPageDomReady(target, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    let session = null;
    try {
      session = await CdpSession.connect(target.webSocketDebuggerUrl, 2000);
      const res = await session.send('Runtime.evaluate', {
        expression: 'Boolean(document.body && document.head)',
        returnByValue: true
      });
      if (res?.result?.value === true) return;
    } catch {
      // Window may still be booting
    } finally {
      session?.close();
    }
    await delay(250);
  }
}

/** One-shot evaluation on every window (used by --reset). */
async function evaluateOnAllTargets(args, source) {
  const targets = await fetchDebugTargets({ host: args.host, port: args.port, titleFilter: args.title });
  if (targets.length === 0) {
    throw new Error(`Không tìm thấy cửa sổ page nào tại http://${args.host}:${args.port}/json/list.`);
  }
  for (const target of targets) {
    const session = await CdpSession.connect(target.webSocketDebuggerUrl);
    try {
      await evaluateSource(session, source);
      console.log(`[OK] Đã gỡ Custom theme -> "${target.title || target.url || target.id}"`);
    } finally {
      session.close();
    }
  }
}

/* ------------------------------------------------------------------ */
/* Background sync daemon                                              */
/* ------------------------------------------------------------------ */

function readDaemonPid() {
  try {
    const pid = Number(fs.readFileSync(DAEMON_PID_PATH, 'utf8').trim());
    if (!Number.isInteger(pid) || pid <= 0) return null;
    process.kill(pid, 0);
    return pid;
  } catch {
    return null;
  }
}

async function runSyncDaemon(args) {
  ensureUserDataDirs();
  writeFileAtomic(DAEMON_PID_PATH, String(process.pid));

  let bundleSource = ensureBuiltBundle(args.build);
  const attached = new Map(); // targetId -> { session, scriptId, title }
  let openSettingsPending = args.openSettings;
  let failedPolls = 0;
  let reported = false;
  let lastError = '';
  let stopping = false;
  let refreshTimer = null;
  const startedAt = Date.now();

  const writeStatus = (obj) => {
    try {
      writeFileAtomic(DAEMON_STATUS_PATH, JSON.stringify({ ...obj, pid: process.pid, at: Date.now() }));
    } catch {
      // ignore
    }
  };

  const shutdown = (code) => {
    if (stopping) return;
    stopping = true;
    clearTimeout(refreshTimer);
    for (const entry of attached.values()) entry.session.close();
    attached.clear();
    try {
      if (fs.readFileSync(DAEMON_PID_PATH, 'utf8').trim() === String(process.pid)) {
        fs.rmSync(DAEMON_PID_PATH, { force: true });
      }
    } catch {
      // ignore
    }
    process.exit(code);
  };

  const takeOpenSettingsFlag = () => {
    if (openSettingsPending) {
      openSettingsPending = false;
      return true;
    }
    if (fs.existsSync(OPEN_SETTINGS_FLAG_PATH)) {
      fs.rmSync(OPEN_SETTINGS_FLAG_PATH, { force: true });
      return true;
    }
    return false;
  };

  const registerNewDocumentScript = async (entry) => {
    const source = buildPayload(bundleSource);
    if (entry.scriptId) {
      try {
        await entry.session.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: entry.scriptId });
      } catch {
        // ignore stale identifier
      }
      entry.scriptId = null;
    }
    try {
      const added = await entry.session.send('Page.addScriptToEvaluateOnNewDocument', { source });
      entry.scriptId = added.identifier || null;
    } catch {
      entry.scriptId = null;
    }
  };

  // Keep reload/new-navigation boot data fresh after the user changes settings
  const scheduleRefresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      for (const entry of attached.values()) {
        registerNewDocumentScript(entry).catch(() => {});
      }
    }, 250);
  };

  const attachTarget = async (target) => {
    await waitForPageDomReady(target, 6000);
    const session = await CdpSession.connect(target.webSocketDebuggerUrl);
    const entry = { session, scriptId: null, title: target.title || target.url || target.id };
    attached.set(target.id, entry);
    session.onClose(() => attached.delete(target.id));
    session.onEvent((method, params) => {
      if (method === 'Runtime.bindingCalled' && params.name === BINDING_NAME) {
        try {
          const kind = persistFromPage(params.payload);
          if (kind) scheduleRefresh();
        } catch (error) {
          console.error(`[sync] Lỗi lưu cấu hình: ${error.message}`);
        }
      }
    });

    try {
      await session.send('Page.enable', {}, 5000);
    } catch {
      // Some WebViews expose Runtime without Page.enable
    }
    await session.send('Runtime.enable', {}, 5000);
    await session.send('Runtime.addBinding', { name: BINDING_NAME });
    await registerNewDocumentScript(entry);
    await evaluateSource(session, buildPayload(bundleSource, { openSettings: takeOpenSettingsFlag() }));
    console.log(`[sync] Đã tiêm & đồng bộ -> "${entry.title}"`);
  };

  const reinjectAll = async ({ rebuild = false } = {}) => {
    try {
      bundleSource = ensureBuiltBundle(rebuild);
    } catch (error) {
      console.error(`[sync] Lỗi build bundle: ${error.message}`);
      return;
    }
    let first = true;
    for (const entry of attached.values()) {
      try {
        await registerNewDocumentScript(entry);
        await evaluateSource(entry.session, buildPayload(bundleSource, { openSettings: first && takeOpenSettingsFlag() }));
        first = false;
        console.log(`[sync] Đã cập nhật lại -> "${entry.title}"`);
      } catch (error) {
        console.error(`[sync] Lỗi cập nhật "${entry.title}": ${error.message}`);
      }
    }
  };

  process.on('SIGHUP', () => {
    reinjectAll().catch(() => {});
  });
  process.on('SIGTERM', () => shutdown(0));
  process.on('SIGINT', () => shutdown(0));

  if (args.watch) {
    let watchTimer = null;
    const watchDirs = [path.join(__dirname, 'src'), path.join(__dirname, 'assets', 'wallpapers')];
    for (const dir of watchDirs) {
      if (!fs.existsSync(dir)) continue;
      fs.watch(dir, { recursive: true }, () => {
        clearTimeout(watchTimer);
        watchTimer = setTimeout(() => {
          reinjectAll({ rebuild: true }).catch(() => {});
        }, 220);
      });
    }
    console.log('[watch] Đang theo dõi src/ và assets/wallpapers/. Nhấn Ctrl+C để dừng.');
  }

  while (!stopping) {
    const targets = await tryFetchDebugTargets(args);
    if (!targets) {
      failedPolls += 1;
    } else {
      failedPolls = 0;
      for (const target of targets) {
        if (attached.has(target.id)) continue;
        try {
          await attachTarget(target);
        } catch (error) {
          lastError = error.message;
          attached.get(target.id)?.session.close();
          attached.delete(target.id);
          console.error(`[sync] Không tiêm được "${target.title || target.id}": ${error.message}`);
        }
      }
      if (!reported && attached.size > 0) {
        reported = true;
        writeStatus({ state: 'ready', injected: attached.size });
      }
    }

    if (!reported && Date.now() - startedAt > args.daemonWaitMs) {
      writeStatus({
        state: 'error',
        message:
          lastError ||
          `Không tìm thấy cửa sổ Antigravity qua cổng CDP ${args.host}:${args.port}. Hãy mở Antigravity bằng Launcher hoặc kèm --remote-debugging-port=${args.port}.`
      });
      shutdown(1);
      return;
    }
    if (reported && failedPolls >= EXIT_AFTER_FAILED_POLLS) {
      console.log('[sync] Antigravity đã đóng, dừng tiến trình đồng bộ.');
      shutdown(0);
      return;
    }
    await delay(POLL_INTERVAL_MS);
  }
}

/** Make sure exactly one background sync process is running and has injected the theme. */
async function ensureSyncDaemon(args) {
  ensureUserDataDirs();
  if (args.build) ensureBuiltBundle(true);

  const alivePid = readDaemonPid();
  if (alivePid) {
    if (args.openSettings) fs.writeFileSync(OPEN_SETTINGS_FLAG_PATH, '1');
    process.kill(alivePid, 'SIGHUP');
    await delay(1500);
    if (readDaemonPid() === alivePid) {
      console.log('[OK] Đã cập nhật Custom theme (tiến trình đồng bộ đang chạy, cấu hình được giữ nguyên).');
      return;
    }
    fs.rmSync(OPEN_SETTINGS_FLAG_PATH, { force: true });
  }

  fs.rmSync(DAEMON_STATUS_PATH, { force: true });
  const logFd = fs.openSync(DAEMON_LOG_PATH, 'w');
  const daemonArgs = [
    SELF_PATH,
    '--sync-daemon',
    '--host',
    args.host,
    '--port',
    String(args.port),
    '--daemon-wait',
    String(args.daemonWaitMs)
  ];
  if (args.title) daemonArgs.push('--title', args.title);
  if (args.openSettings) daemonArgs.push('--open-settings');

  const child = spawn(process.execPath, daemonArgs, {
    cwd: __dirname,
    detached: true,
    stdio: ['ignore', logFd, logFd]
  });
  child.unref();
  fs.closeSync(logFd);

  const deadline = Date.now() + args.daemonWaitMs + 10000;
  while (Date.now() < deadline) {
    const status = readJsonFile(DAEMON_STATUS_PATH);
    if (status?.state === 'ready') {
      console.log(
        `[OK] Đã tiêm Custom theme vào ${status.injected} cửa sổ. Cấu hình lưu bền vững tại ${USER_CONFIG_PATH}`
      );
      return;
    }
    if (status?.state === 'error') {
      throw new Error(status.message);
    }
    await delay(300);
  }
  throw new Error(`Quá thời gian chờ tiến trình đồng bộ khởi động. Xem log: ${DAEMON_LOG_PATH}`);
}

async function stopSyncDaemon() {
  const pid = readDaemonPid();
  if (!pid) return;
  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    return;
  }
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline && readDaemonPid() === pid) {
    await delay(150);
  }
}

/* ------------------------------------------------------------------ */
/* macOS launch helper                                                 */
/* ------------------------------------------------------------------ */

function isMacAppRunning(appName) {
  const baseName = path.basename(appName, '.app');
  try {
    const out = execFileSync(
      'osascript',
      ['-e', `application "${baseName.replace(/"/g, '\\"')}" is running`],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    if (out === 'true') return true;
  } catch {
    // Fallback to pgrep
  }
  try {
    execFileSync('pgrep', ['-x', baseName], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function confirmMacRestartForCdp(appName, port) {
  const baseName = path.basename(appName, '.app');
  try {
    execFileSync(
      'osascript',
      [
        '-e',
        `display dialog "${baseName} đang mở ở chế độ thường (chưa bật cổng theme ${port}). Bạn muốn đóng app và mở lại kèm Custom theme ngay không?" buttons {"Hủy", "Mở lại kèm Theme"} default button "Mở lại kèm Theme" with title "Antigravity Custom Theme"`
      ],
      { stdio: 'ignore' }
    );
    return true;
  } catch {
    return false;
  }
}

async function launchAndInject(args) {
  let targets = await tryFetchDebugTargets(args);
  if (targets && targets.length > 0) {
    if (process.platform === 'darwin') {
      try {
        execFileSync('open', ['-a', args.app], { stdio: 'ignore' });
      } catch {
        // Ignore activation errors
      }
    }
    await ensureSyncDaemon(args);
    return;
  }

  if (process.platform !== 'darwin') {
    throw new Error('Cờ --launch tự mở app hiện hỗ trợ trực tiếp trên macOS.');
  }

  // Stop any lingering sync-daemon from a previous session before a cold relaunch
  await stopSyncDaemon();

  if (!targets && isMacAppRunning(args.app)) {
    const confirmed = confirmMacRestartForCdp(args.app, args.port);
    if (!confirmed) {
      console.log('[launch] Đã hủy mở lại theo lựa chọn người dùng.');
      return;
    }
    const baseName = path.basename(args.app, '.app');
    try {
      execFileSync('osascript', ['-e', `tell application "${baseName.replace(/"/g, '\\"')}" to quit`], {
        stdio: 'ignore'
      });
    } catch {
      // Ignore quit scripting errors
    }
    const quitDeadline = Date.now() + 9000;
    while (Date.now() < quitDeadline && isMacAppRunning(args.app)) {
      await delay(300);
    }
    if (isMacAppRunning(args.app)) {
      throw new Error(
        `${baseName} chưa thoát hoàn toàn (có thể đang có hộp thoại cần xác nhận). Hãy bấm Cmd+Q rồi chạy lại Launcher.`
      );
    }
  }

  if (!targets) {
    execFileSync(
      'open',
      ['-a', args.app, '--args', `--remote-debugging-port=${args.port}`, '--remote-allow-origins=*'],
      { stdio: 'ignore' }
    );
  }

  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    targets = await tryFetchDebugTargets(args);
    if (targets && targets.length > 0) break;
    await delay(400);
  }
  if (!targets || targets.length === 0) {
    throw new Error(`Đã mở ${args.app} nhưng quá thời gian chờ cổng CDP ${args.host}:${args.port}.`);
  }

  await ensureSyncDaemon(args);
}

/* ------------------------------------------------------------------ */
/* Entry                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (args.syncDaemon) {
    await runSyncDaemon(args);
    return;
  }

  if (args.dryRun) {
    const bundle = ensureBuiltBundle(args.build);
    const source = args.reset ? RESET_SCRIPT : buildPayload(bundle, { openSettings: args.openSettings });
    const cfg = readUserConfig();
    console.log('[dry-run] Bundle hợp lệ.');
    console.log(`[dry-run] CDP target: http://${args.host}:${args.port}/json/list`);
    console.log(`[dry-run] Bundle: ${DIST_BUNDLE_PATH}`);
    console.log(`[dry-run] Cấu hình đã lưu: ${cfg ? USER_CONFIG_PATH : '(chưa có — sẽ tạo khi bạn chỉnh Custom theme)'}`);
    console.log(`[dry-run] Kích thước payload: ${Buffer.byteLength(source, 'utf8')} bytes`);
    if (args.launch) console.log(`[dry-run] Chế độ --launch sẽ mở "${args.app}" với cổng CDP ${args.port}.`);
    return;
  }

  if (args.reset) {
    await stopSyncDaemon();
    await evaluateOnAllTargets(args, RESET_SCRIPT);
    return;
  }

  if (args.watch) {
    await stopSyncDaemon();
    await runSyncDaemon({ ...args, build: true });
    return;
  }

  if (args.launch) {
    await launchAndInject(args);
    return;
  }

  await ensureSyncDaemon({ ...args, daemonWaitMs: Math.min(args.daemonWaitMs, 8000) });
}

const isDirectRun = (() => {
  try {
    return fs.realpathSync(process.argv[1] || '') === fs.realpathSync(SELF_PATH);
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  main().catch((error) => {
    console.error(`[LỖI] ${error.message}`);
    process.exitCode = 1;
  });
}

export { buildPayload, persistFromPage };
