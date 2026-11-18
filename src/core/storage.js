/**
 * Configuration & Custom Media Storage.
 * Uses localStorage for synchronous config and IndexedDB for uploaded binary/dataURL images.
 */

const STORAGE_KEY = 'agy_custom_theme_config_v1';
const DB_NAME = 'agy_custom_theme_media_v1';
const STORE_NAME = 'assets';

export const DEFAULT_CONFIG = {
  enabled: true,
  lang: 'vi',
  wallpaperId: 'thunder-samurai',
  wallpaperFit: 'cover',
  dimming: 16,
  blur: 0,
  glassOpacity: 36,
  accentColor: '#f5c451',
  atmosphereId: 'thunder-rain',
  atmosphereIntensity: 65,
  bubbleId: 'loi-kiem',
  bubbleMascotEnabled: true,
  aiCard: {
    enabled: true,
    opacity: 82,
    blur: 16
  },
  inputId: 'loi-anh-kim',
  pet: {
    enabled: true,
    id: 'loi-kiem',
    size: 88,
    opacity: 96,
    mode: 'float', // 'float' | 'roam' | 'follow'
    pos: { xPct: 22, yPct: 12 },
    showSpeechOnClick: true
  },
  stickers: {
    enabled: true,
    items: [
      { id: 'bua-loi-an', slot: 'input-top-right', size: 54, glow: true, opacity: 96, pos: { xPct: 82, yPct: 72 } },
      { id: 'trang-sao', slot: 'greeting-badge', size: 46, glow: true, opacity: 92, pos: { xPct: 68, yPct: 46 } }
    ]
  },
  customSelectors: {
    appShell: '',
    sidebar: '',
    mainCanvas: '',
    chatBubble: '',
    aiResponse: '',
    chatInput: '',
    settingsNavList: '',
    settingsContent: ''
  },
  hiddenWallpapers: [],
  hiddenStickers: [],
  hiddenPets: [],
  customBundles: []
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeDeep(base, patch) {
  const out = deepClone(base);
  if (!patch || typeof patch !== 'object') return out;
  for (const [k, v] of Object.entries(patch)) {
    if (Array.isArray(v)) {
      out[k] = deepClone(v);
    } else if (v && typeof v === 'object' && !Array.isArray(out[k]) && typeof out[k] === 'object') {
      out[k] = mergeDeep(out[k], v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Send a persistence message to the host sync process (inject.mjs) through the
 * CDP `Runtime.addBinding` bridge, so config/media survive app restarts even when
 * the Electron page's localStorage/IndexedDB origin changes or is not persisted.
 */
function persistToHost(message) {
  try {
    const fn = typeof window !== 'undefined' ? window.__agyCtPersist : null;
    if (typeof fn === 'function') fn(JSON.stringify(message));
  } catch {
    // Host bridge unavailable (preview.html / manual DevTools run)
  }
}

function getBootData() {
  try {
    const boot = typeof window !== 'undefined' ? window.__AGY_CT_BOOT__ : null;
    return boot && typeof boot === 'object' ? boot : null;
  } catch {
    return null;
  }
}

function readLocalConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function loadConfig() {
  const local = readLocalConfig();
  const bootCfg = getBootData()?.config;
  const boot = bootCfg && typeof bootCfg === 'object' ? bootCfg : null;

  let chosen = local;
  if (boot && (!local || Number(boot.__savedAt || 0) >= Number(local.__savedAt || 0))) {
    chosen = boot;
  }
  if (!chosen) return deepClone(DEFAULT_CONFIG);

  const cfg = mergeDeep(DEFAULT_CONFIG, chosen);
  if (chosen === boot) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch {
      // Ignore storage quota errors in restricted sandboxes
    }
  }
  return cfg;
}

export function saveConfig(cfg) {
  cfg.__savedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }
  persistToHost({ type: 'config', data: cfg });
}

/** Push current config to host only if host has no saved config yet (initial migration). */
export function syncConfigToHost(cfg) {
  persistToHost({ type: 'config-init', data: cfg });
}

/** Reset look & feel to defaults while keeping permanently deleted items deleted. */
export function resetConfig(current = null) {
  const fresh = deepClone(DEFAULT_CONFIG);
  if (current) {
    fresh.hiddenWallpapers = [...(current.hiddenWallpapers || [])];
    fresh.hiddenStickers = [...(current.hiddenStickers || [])];
    fresh.hiddenPets = [...(current.hiddenPets || [])];
    fresh.customBundles = deepClone(current.customBundles || []);
    fresh.customSelectors = { ...fresh.customSelectors, ...(current.customSelectors || {}) };
    const hiddenStickers = new Set(fresh.hiddenStickers);
    fresh.stickers.items = fresh.stickers.items.filter((it) => !hiddenStickers.has(it.id));
    if (fresh.hiddenPets.includes(fresh.pet.id)) fresh.pet.enabled = false;
    if (fresh.hiddenWallpapers.includes(fresh.wallpaperId)) fresh.wallpaperId = 'none';
  }
  saveConfig(fresh);
  return fresh;
}

export function mergeConfig(current, patch) {
  return mergeDeep(current, patch);
}

// IndexedDB helper for large custom user images (wallpaper / custom pet / custom sticker)
function openMediaDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomMedia(key, dataUrl) {
  persistToHost({ type: 'media', key, dataUrl });
  await writeMediaToDb(key, dataUrl);
}

async function writeMediaToDb(key, dataUrl) {
  try {
    const db = await openMediaDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Fallback to session memory handled by caller
  }
}

async function deleteMediaFromDb(key) {
  try {
    const db = await openMediaDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore when IndexedDB unavailable
  }
}

export async function deleteCustomMedia(key) {
  persistToHost({ type: 'media', key, dataUrl: null });
  await deleteMediaFromDb(key);
}

export async function clearAllCustomMedia() {
  persistToHost({ type: 'media-clear' });
  try {
    const db = await openMediaDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore when IndexedDB unavailable
  }
}

export async function loadCustomMediaMap() {
  const keys = ['wallpaper', 'pet', 'sticker'];
  const result = {};
  try {
    const db = await openMediaDb();
    await Promise.all(
      keys.map(
        (key) =>
          new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get(key);
            req.onsuccess = () => {
              if (req.result) result[key] = req.result;
              resolve();
            };
            req.onerror = () => resolve();
          })
      )
    );
    db.close();
  } catch {
    // Ignore when IndexedDB unavailable
  }

  // Merge media persisted on disk by the host sync process (survives origin/profile changes)
  const boot = getBootData();
  if (boot) {
    const hasHostConfig = Boolean(boot.config && typeof boot.config === 'object');
    const bootMedia = boot.media && typeof boot.media === 'object' ? boot.media : {};
    for (const key of keys) {
      const fromDisk = typeof bootMedia[key] === 'string' ? bootMedia[key] : '';
      if (fromDisk && (!result[key] || (hasHostConfig && result[key] !== fromDisk))) {
        result[key] = fromDisk;
        writeMediaToDb(key, fromDisk);
      } else if (result[key] && !fromDisk) {
        if (hasHostConfig) {
          // Host disk state is authoritative once initialized: purge stale deleted media from IndexedDB
          delete result[key];
          deleteMediaFromDb(key);
        } else {
          persistToHost({ type: 'media', key, dataUrl: result[key] });
        }
      }
    }
  }
  return result;
}
