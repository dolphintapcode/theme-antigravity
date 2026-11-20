import { WALLPAPERS, resolveWallpaperUrl } from '../assets/wallpapers-manifest.js';
import { BUBBLE_PRESETS } from '../presets/bubbles.js';
import { INPUT_PRESETS } from '../presets/inputs.js';
import { ATMOSPHERE_PRESETS } from '../presets/atmosphere.js';
import { ACCENT_COLORS } from '../presets/themes.js';
import { MASCOT_TEMPLATES, renderMascotSvg } from '../assets/mascots.js';
import { STICKER_TEMPLATES, renderStickerSvg } from '../assets/stickers.js';

const I18N = {
  vi: {
    title: 'Custom theme',
    subtitle: 'Tùy biến ảnh nền, hiệu ứng, bong bóng chat, khung nhập, sticker và thú cưng (chế độ injector không sửa file gốc).',
    enableTheme: 'Bật Custom theme',
    clearRamBtn: '🧹 Dọn RAM',
    clearRamDone: '✓ Đã dọn RAM',
    exportBtn: 'Xuất JSON',
    importBtn: 'Nhập JSON',
    resetBtn: 'Mặc định',
    bundlesTitle: 'Gói chủ đề riêng',
    bundlesSub: 'Không ghim gói mặc định. Bạn có thể tự lưu cấu hình đang dùng thành gói để chuyển nhanh và tuỳ chỉnh từng gói.',
    saveBundleBtn: '+ Lưu cài đặt hiện tại thành gói',
    bundlesEmpty: 'Chưa có gói nào. Bấm "+ Lưu cài đặt hiện tại thành gói" nếu bạn muốn tạo bộ preset riêng.',
    wpTitle: 'Ảnh nền & Độ sáng',
    wpSub: 'Chọn ảnh nền có sẵn hoặc tải ảnh 4K/8K gốc từ máy (giữ 100% độ phân giải gốc, đặt Làm mờ = 0px để nét nhất). Bấm ✕ để xoá.',
    uploadWp: 'Tải ảnh lên...',
    wpFitLabel: 'Hiển thị ảnh nền',
    wpFitCover: 'Lấp đầy (Cover)',
    wpFitContain: 'Nguyên khung (Contain)',
    dimLabel: 'Độ tối',
    dimDesc: 'Điều chỉnh độ rõ của ảnh để dễ đọc nội dung.',
    blurLabel: 'Làm mờ nền',
    blurDesc: 'Tạo chiều sâu nhẹ cho ảnh nền phía sau chữ (0px = sắc nét 100%).',
    glassLabel: 'Độ đục bảng điều khiển',
    glassDesc: 'Điều chỉnh độ trong suốt của sidebar và nền chat.',
    accentLabel: 'Màu nhấn (Accent)',
    atmoTitle: 'Hiệu ứng môi trường',
    atmoSub: 'Hiệu ứng hạt chuyển động nhẹ phía sau giao diện.',
    atmoIntensity: 'Mật độ hiệu ứng',
    bubbleTitle: 'Bong bóng chat',
    bubbleSub: 'Chọn một mẫu để áp dụng ngay cho tin nhắn của bạn.',
    bubbleMascot: 'Hiện linh vật trên bong bóng',
    clearBubbleBtn: '🧹 Xoá bong bóng & icon',
    aiCardTitle: 'Khung kính câu trả lời AI (Glass Card)',
    aiCardSub: 'Bọc câu trả lời của AI trong thẻ kính mờ cao cấp, chống chói và chống nuốt chữ trên mọi ảnh nền.',
    aiCardToggle: 'Bật khung kính AI',
    aiCardOpacity: 'Độ tối khung AI',
    aiCardBlur: 'Độ mờ kính AI',
    inputTitle: 'Khung nhập chat',
    inputSub: 'Chọn phong cách cho khung soạn tin nhắn; không thay đổi chức năng nhập.',
    stickerTitle: 'Sticker trang trí',
    stickerSub: 'Click để bật/tắt trên màn hình, bấm ✕ để xoá vĩnh viễn (có bước phê duyệt trước khi xoá).',
    enableStickers: 'Hiển thị sticker',
    uploadSticker: '+ Tải sticker PNG/GIF',
    clearStickersBtn: '🗑 Xoá hết sticker',
    activeStickers: 'Sticker đang bật',
    petTitle: 'Thú cưng tương tác (Pet)',
    petSub: 'Chọn bạn đồng hành hiển thị trên màn hình. Bấm ✕ để xoá vĩnh viễn (có bước phê duyệt).',
    enablePet: 'Hiển thị Pet',
    uploadPet: '+ Tải Pet PNG/GIF',
    disablePetBtn: '🗑 Tắt & Xoá Pet',
    petMode: 'Chế độ di chuyển',
    petSize: 'Kích thước Pet',
    petOpacity: 'Độ rõ Pet',
    petSpeech: 'Hiện lời thoại khi click vào Pet',
    advTitle: 'Nâng cao & Chọn vùng DOM (Injector)',
    advSub: 'Nếu bản cập nhật Antigravity đổi tên class, dùng công cụ chọn trực tiếp phần tử cần trang trí.',
    pickBubble: '🎯 Chọn Bong bóng chat',
    pickAiResponse: '🎯 Chọn Câu trả lời AI',
    pickInput: '🎯 Chọn Khung nhập chat',
    pickSidebar: '🎯 Chọn Sidebar',
    clearSelectors: 'Xoá Selector tuỳ chỉnh',
    confirmCancel: 'Hủy',
    confirmDeleteBtn: 'Phê duyệt xoá',
    confirmPermanentNote: 'Hành động này sẽ xoá vĩnh viễn mục khỏi danh sách của bạn (không tự hiện lại khi khởi động lại).'
  },
  en: {
    title: 'Custom theme',
    subtitle: 'Customize wallpaper, atmosphere, chat bubbles, composer box, stickers, and interactive pets via non-destructive JS injector.',
    enableTheme: 'Enable Custom theme',
    clearRamBtn: '🧹 Free RAM',
    clearRamDone: '✓ Cache Freed',
    exportBtn: 'Export JSON',
    importBtn: 'Import JSON',
    resetBtn: 'Reset',
    bundlesTitle: 'My Custom Packs',
    bundlesSub: 'No hardcoded packs pinned. Save your current look as a custom pack and edit each pack anytime.',
    saveBundleBtn: '+ Save Current as Pack',
    bundlesEmpty: 'No custom packs saved yet. Click "+ Save Current as Pack" if you want quick reusable setups.',
    wpTitle: 'Wallpaper & Readability',
    wpSub: 'Pick a built-in wallpaper or upload original 4K/8K files (kept 100% lossless; keep Blur at 0px for maximum sharpness).',
    uploadWp: 'Upload Image...',
    wpFitLabel: 'Wallpaper Fit',
    wpFitCover: 'Fill Screen (Cover)',
    wpFitContain: 'Full Image (Contain)',
    dimLabel: 'Dimming',
    dimDesc: 'Adjust background darkness for comfortable text contrast.',
    blurLabel: 'Background Blur',
    blurDesc: 'Add subtle depth blur behind UI panels (0px = 100% sharp).',
    glassLabel: 'Panel Glass Opacity',
    glassDesc: 'Control sidebar and surface translucency.',
    accentLabel: 'Accent Color',
    atmoTitle: 'Ambient Atmosphere',
    atmoSub: 'Lightweight particle overlay behind interactive UI.',
    atmoIntensity: 'Effect Density',
    bubbleTitle: 'Chat Bubbles',
    bubbleSub: 'Choose a preset style for your chat messages.',
    bubbleMascot: 'Show mascot topper on bubbles',
    clearBubbleBtn: '🧹 Clear bubble & icon',
    aiCardTitle: 'AI Response Glass Card',
    aiCardSub: 'Wraps AI answers in a modern glassmorphism card for crystal clear readability on all wallpapers.',
    aiCardToggle: 'Enable AI Glass Card',
    aiCardOpacity: 'AI Card Darkness',
    aiCardBlur: 'AI Card Blur',
    inputTitle: 'Chat Input Box',
    inputSub: 'Customize the composer frame without altering typing functionality.',
    stickerTitle: 'Decorative Stickers',
    stickerSub: 'Click to toggle stickers on screen, or click ✕ to permanently delete (asks approval first).',
    enableStickers: 'Show stickers',
    uploadSticker: '+ Upload PNG/GIF',
    clearStickersBtn: '🗑 Clear all stickers',
    activeStickers: 'Active Stickers',
    petTitle: 'Interactive Pet',
    petSub: 'Pick a floating companion or click ✕ to permanently delete (asks approval first).',
    enablePet: 'Show Pet',
    uploadPet: '+ Upload Pet PNG/GIF',
    disablePetBtn: '🗑 Remove Pet',
    petMode: 'Movement Mode',
    petSize: 'Pet Size',
    petOpacity: 'Pet Opacity',
    petSpeech: 'Show speech bubble on click',
    advTitle: 'Advanced & DOM Selector Picker',
    advSub: 'If an app update changes CSS classes, pick elements visually to bind styles cleanly.',
    pickBubble: '🎯 Pick Chat Bubble',
    pickAiResponse: '🎯 Pick AI Response Area',
    pickInput: '🎯 Pick Input Box',
    pickSidebar: '🎯 Pick Sidebar',
    clearSelectors: 'Clear Custom Selectors',
    confirmCancel: 'Cancel',
    confirmDeleteBtn: 'Approve Delete',
    confirmPermanentNote: 'This permanently removes the item from your list and persists across restarts.'
  }
};

const SLOT_LABELS = {
  vi: {
    'input-top-right': 'Góc phải khung chat',
    'input-top-left': 'Góc trái khung chat',
    'greeting-badge': 'Vùng giữa màn hình',
    'sidebar-bottom-right': 'Góc dưới Sidebar',
    free: 'Vị trí tự do (kéo thả)'
  },
  en: {
    'input-top-right': 'Input Top-Right',
    'input-top-left': 'Input Top-Left',
    'greeting-badge': 'Center Area',
    'sidebar-bottom-right': 'Sidebar Bottom-Right',
    free: 'Free Dragged Position'
  }
};

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export class SettingsPanel {
  constructor({
    getConfig,
    getCustomMedia,
    onPatch,
    onLiveUpdate,
    onBundleApply,
    onReset,
    onUploadMedia,
    onDeleteMedia,
    onClearRam,
    onStartPicker
  }) {
    this.getConfig = getConfig;
    this.getCustomMedia = getCustomMedia;
    this.onPatch = onPatch;
    this.onLiveUpdate = onLiveUpdate;
    this.onBundleApply = onBundleApply;
    this.onReset = onReset;
    this.onUploadMedia = onUploadMedia;
    this.onDeleteMedia = onDeleteMedia;
    this.onClearRam = onClearRam;
    this.onStartPicker = onStartPicker;
    this.thumbCache = new Map();
    this.ramToast = false;
    this.modalOverlay = null;
    this.onModalKeyDown = null;

    this.root = document.createElement('section');
    this.root.id = 'agy-ct-settings-panel';
    this.root.setAttribute('data-agy-ct-injected', 'true');
    this.root.setAttribute('aria-label', 'Custom theme settings');

    this.bindRootEvents();
  }

  getElement() {
    return this.root;
  }

  isOpen() {
    return Boolean(this.root.classList.contains('is-open') && this.root.isConnected);
  }

  clearView() {
    this.closeModal();
    this.root.classList.remove('is-open');
    this.root.innerHTML = '';
  }

  closeModal() {
    if (this.onModalKeyDown) {
      document.removeEventListener('keydown', this.onModalKeyDown, true);
      this.onModalKeyDown = null;
    }
    if (this.modalOverlay) {
      this.modalOverlay.remove();
      this.modalOverlay = null;
    }
    document.getElementById('agy-ct-modal-overlay')?.remove();
  }

  openModal(html) {
    this.closeModal();
    const overlay = document.createElement('div');
    overlay.id = 'agy-ct-modal-overlay';
    overlay.setAttribute('data-agy-ct-injected', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `<div class="agy-ct-modal-card">${html}</div>`;
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target === overlay || e.target.closest('[data-modal-act="cancel"]')) {
        this.closeModal();
      }
    });
    this.onModalKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal();
      }
    };
    document.addEventListener('keydown', this.onModalKeyDown, true);
    document.body.appendChild(overlay);
    this.modalOverlay = overlay;
    return overlay;
  }

  requestConfirm({ title, message, note = '', confirmLabel, onConfirm }) {
    const lang = this.getConfig().lang === 'en' ? 'en' : 'vi';
    const t = I18N[lang];
    const overlay = this.openModal(`
      <div class="agy-ct-modal-head">
        <h4>⚠️ ${escapeHtml(title)}</h4>
      </div>
      <div class="agy-ct-modal-body">
        <div>${escapeHtml(message)}</div>
        ${note ? `<div class="agy-ct-modal-note">${escapeHtml(note)}</div>` : ''}
      </div>
      <div class="agy-ct-modal-actions">
        <button type="button" class="agy-ct-btn" data-modal-act="cancel">${escapeHtml(t.confirmCancel)}</button>
        <button type="button" class="agy-ct-btn agy-ct-btn-danger" data-modal-act="approve">${escapeHtml(confirmLabel || t.confirmDeleteBtn)}</button>
      </div>
    `);
    overlay.querySelector('[data-modal-act="cancel"]')?.focus();
    overlay.querySelector('[data-modal-act="approve"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeModal();
      onConfirm();
    });
  }

  getCustomWallpapersList() {
    const cfg = this.getConfig();
    const customMedia = this.getCustomMedia();
    const list = Array.isArray(cfg.customWallpapers) ? [...cfg.customWallpapers] : [];
    if ((customMedia.wallpaper || customMedia.custom) && !list.some((w) => w.id === 'custom')) {
      list.unshift({ id: 'custom', name: 'Custom Image' });
    }
    for (const key of Object.keys(customMedia)) {
      if (key.startsWith('custom-wp-') && !list.some((w) => w.id === key)) {
        list.push({ id: key, name: 'Custom Image' });
      }
    }
    return list;
  }

  snapshotBundlePatch(cfg) {
    return {
      wallpaperId: cfg.wallpaperId,
      wallpaperFit: cfg.wallpaperFit || 'cover',
      dimming: cfg.dimming,
      blur: cfg.blur,
      glassOpacity: cfg.glassOpacity,
      accentColor: cfg.accentColor,
      atmosphereId: cfg.atmosphereId,
      atmosphereIntensity: cfg.atmosphereIntensity,
      bubbleId: cfg.bubbleId,
      bubbleMascotEnabled: Boolean(cfg.bubbleMascotEnabled),
      aiCard: JSON.parse(JSON.stringify(cfg.aiCard || { enabled: true, opacity: 82, blur: 16 })),
      inputId: cfg.inputId,
      pet: JSON.parse(JSON.stringify(cfg.pet || { enabled: false, id: '' })),
      stickers: JSON.parse(JSON.stringify(cfg.stickers || { enabled: false, items: [] }))
    };
  }

  summarizeBundle(bundle, lang) {
    const p = bundle?.patch || {};
    const customMedia = this.getCustomMedia();
    const wpObj = WALLPAPERS.find((w) => w.id === p.wallpaperId);
    const customWp = this.getCustomWallpapersList().find((w) => w.id === p.wallpaperId);
    const isCustom = p.wallpaperId === 'custom' || p.wallpaperId?.startsWith('custom-');
    const hasCustom =
      isCustom &&
      Boolean(
        customMedia[p.wallpaperId] ||
          (p.wallpaperId === 'custom' && (customMedia.custom || customMedia.wallpaper))
      );
    const wpName = isCustom
      ? hasCustom
        ? (customWp?.name || 'Custom Image')
        : (lang === 'en' ? 'No Wallpaper' : 'Không nền')
      : wpObj
      ? lang === 'en'
        ? wpObj.nameEn
        : wpObj.name
      : p.wallpaperId || 'none';
    const atmoObj = ATMOSPHERE_PRESETS.find((a) => a.id === p.atmosphereId);
    const atmoName = atmoObj ? (lang === 'en' ? atmoObj.nameEn : atmoObj.name) : '';
    const petName =
      p.pet?.enabled && p.pet?.id
        ? p.pet.id === 'custom'
          ? 'Custom Pet'
          : (lang === 'en' ? MASCOT_TEMPLATES[p.pet.id]?.nameEn : MASCOT_TEMPLATES[p.pet.id]?.name) || p.pet.id
        : lang === 'en'
        ? 'No Pet'
        : 'Tắt Pet';
    return [wpName, atmoName, petName].filter(Boolean).join(' · ');
  }

  openBundleEditor(existingBundle = null) {
    const cfg = this.getConfig();
    const customMedia = this.getCustomMedia();
    const lang = cfg.lang === 'en' ? 'en' : 'vi';
    const isEdit = Boolean(existingBundle);
    const draft = isEdit
      ? JSON.parse(JSON.stringify(existingBundle))
      : {
          id: `pack-${Date.now()}`,
          name: lang === 'en' ? `My Pack ${(cfg.customBundles || []).length + 1}` : `Gói của tôi ${(cfg.customBundles || []).length + 1}`,
          badge: lang === 'en' ? 'Custom' : 'Tuỳ chỉnh',
          patch: this.snapshotBundlePatch(cfg)
        };

    const hiddenWps = new Set(cfg.hiddenWallpapers || []);
    const hiddenPets = new Set(cfg.hiddenPets || []);
    const visibleWps = WALLPAPERS.filter((wp) => wp.id === 'none' || !hiddenWps.has(wp.id));
    const visiblePets = Object.entries(MASCOT_TEMPLATES).filter(([id, m]) => m.role.includes('pet') && !hiddenPets.has(id));
    const p = draft.patch || this.snapshotBundlePatch(cfg);

    const customWallpapers = this.getCustomWallpapersList();
    const wpOptions = [
      ...visibleWps.map((w) => [w.id, lang === 'en' ? w.nameEn : w.name]),
      ...customWallpapers.map((w) => [w.id, w.name || 'Custom Image'])
    ];
    const petOptions = [
      ['', lang === 'en' ? 'Disabled (No Pet)' : 'Tắt Pet'],
      ...visiblePets.map(([id, m]) => [id, lang === 'en' ? m.nameEn : m.name]),
      ...(customMedia.pet ? [['custom', 'Custom Pet']] : [])
    ];

    const overlay = this.openModal(`
      <div class="agy-ct-modal-head">
        <h4>✏️ ${escapeHtml(isEdit ? (lang === 'en' ? 'Customize Pack' : 'Tuỳ chỉnh gói chủ đề') : lang === 'en' ? 'Save New Custom Pack' : 'Lưu thành gói chủ đề mới')}</h4>
      </div>
      <div class="agy-ct-modal-body">
        <div class="agy-ct-form-grid">
          <label class="agy-ct-field agy-ct-field--full">
            <span>${lang === 'en' ? 'Pack Name' : 'Tên gói'}</span>
            <input type="text" class="agy-ct-input" data-be="name" value="${escapeHtml(draft.name)}" />
          </label>
          <label class="agy-ct-field">
            <span>${lang === 'en' ? 'Badge' : 'Nhãn ngắn'}</span>
            <input type="text" class="agy-ct-input" data-be="badge" value="${escapeHtml(draft.badge || '')}" />
          </label>
          <label class="agy-ct-field">
            <span>${lang === 'en' ? 'Wallpaper' : 'Ảnh nền'}</span>
            <select class="agy-ct-select" data-be="wallpaperId">
              ${wpOptions.map(([id, lbl]) => `<option value="${escapeHtml(id)}" ${p.wallpaperId === id ? 'selected' : ''}>${escapeHtml(lbl)}</option>`).join('')}
            </select>
          </label>
          <label class="agy-ct-field">
            <span>${lang === 'en' ? 'Atmosphere' : 'Hiệu ứng'}</span>
            <select class="agy-ct-select" data-be="atmosphereId">
              ${ATMOSPHERE_PRESETS.map((a) => `<option value="${escapeHtml(a.id)}" ${p.atmosphereId === a.id ? 'selected' : ''}>${escapeHtml(lang === 'en' ? a.nameEn : a.name)}</option>`).join('')}
            </select>
          </label>
          <label class="agy-ct-field">
            <span>${lang === 'en' ? 'Chat Bubble' : 'Bong bóng chat'}</span>
            <select class="agy-ct-select" data-be="bubbleId">
              ${BUBBLE_PRESETS.map((b) => `<option value="${escapeHtml(b.id)}" ${p.bubbleId === b.id ? 'selected' : ''}>${escapeHtml(lang === 'en' ? b.nameEn : b.name)}</option>`).join('')}
            </select>
          </label>
          <label class="agy-ct-field">
            <span>${lang === 'en' ? 'Input Box' : 'Khung nhập chat'}</span>
            <select class="agy-ct-select" data-be="inputId">
              ${INPUT_PRESETS.map((i) => `<option value="${escapeHtml(i.id)}" ${p.inputId === i.id ? 'selected' : ''}>${escapeHtml(lang === 'en' ? i.nameEn : i.name)}</option>`).join('')}
            </select>
          </label>
          <label class="agy-ct-field">
            <span>Pet</span>
            <select class="agy-ct-select" data-be="petId">
              ${petOptions.map(([id, lbl]) => `<option value="${escapeHtml(id)}" ${(p.pet?.enabled ? p.pet?.id : '') === id ? 'selected' : ''}>${escapeHtml(lbl)}</option>`).join('')}
            </select>
          </label>
          <label class="agy-ct-field">
            <span>${lang === 'en' ? 'Dimming (%)' : 'Độ tối (%)'}</span>
            <input type="number" class="agy-ct-input" min="0" max="92" data-be="dimming" value="${Number(p.dimming ?? 28)}" />
          </label>
          <label class="agy-ct-field">
            <span>${lang === 'en' ? 'Blur (px)' : 'Làm mờ (px)'}</span>
            <input type="number" class="agy-ct-input" min="0" max="20" data-be="blur" value="${Number(p.blur ?? 0)}" />
          </label>
          <label class="agy-ct-field">
            <span>${lang === 'en' ? 'Glass Opacity (%)' : 'Độ đục bảng (%)'}</span>
            <input type="number" class="agy-ct-input" min="20" max="92" data-be="glassOpacity" value="${Number(p.glassOpacity ?? 44)}" />
          </label>
          <label class="agy-ct-field">
            <span>${lang === 'en' ? 'Wallpaper Fit' : 'Tỉ lệ nền'}</span>
            <select class="agy-ct-select" data-be="wallpaperFit">
              <option value="cover" ${(p.wallpaperFit || 'cover') === 'cover' ? 'selected' : ''}>Cover</option>
              <option value="contain" ${p.wallpaperFit === 'contain' ? 'selected' : ''}>Contain</option>
            </select>
          </label>
        </div>
        ${
          isEdit
            ? `<button type="button" class="agy-ct-btn" data-modal-act="sync-current">🔄 ${lang === 'en' ? 'Load all values from current active theme' : 'Nạp toàn bộ thông số từ giao diện đang bật'}</button>`
            : ''
        }
        <div class="agy-ct-modal-note">${
          lang === 'en'
            ? 'Stickers & accent color from your current setup (or existing pack) are preserved automatically.'
            : 'Màu nhấn và sticker hiện tại sẽ được giữ theo gói.'
        }</div>
      </div>
      <div class="agy-ct-modal-actions">
        <button type="button" class="agy-ct-btn" data-modal-act="cancel">${lang === 'en' ? 'Cancel' : 'Hủy'}</button>
        <button type="button" class="agy-ct-btn agy-ct-btn-accent" data-modal-act="save">${lang === 'en' ? 'Save Pack' : 'Lưu gói'}</button>
      </div>
    `);

    const getField = (key) => overlay.querySelector(`[data-be="${key}"]`);
    let syncedExtra = null;
    overlay.querySelector('[data-modal-act="sync-current"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const live = this.snapshotBundlePatch(this.getConfig());
      syncedExtra = { accentColor: live.accentColor, atmosphereIntensity: live.atmosphereIntensity, bubbleMascotEnabled: live.bubbleMascotEnabled, aiCard: live.aiCard, stickers: live.stickers, pet: live.pet };
      getField('wallpaperId').value = live.wallpaperId;
      getField('wallpaperFit').value = live.wallpaperFit;
      getField('atmosphereId').value = live.atmosphereId;
      getField('bubbleId').value = live.bubbleId;
      getField('inputId').value = live.inputId;
      getField('petId').value = live.pet?.enabled ? live.pet.id || '' : '';
      getField('dimming').value = String(live.dimming);
      getField('blur').value = String(live.blur);
      getField('glassOpacity').value = String(live.glassOpacity);
    });

    overlay.querySelector('[data-modal-act="save"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const basePatch = JSON.parse(JSON.stringify(draft.patch || {}));
      if (syncedExtra) Object.assign(basePatch, syncedExtra);
      const selectedPetId = getField('petId').value;
      const nextPatch = {
        ...basePatch,
        wallpaperId: getField('wallpaperId').value,
        wallpaperFit: getField('wallpaperFit').value === 'contain' ? 'contain' : 'cover',
        atmosphereId: getField('atmosphereId').value,
        bubbleId: getField('bubbleId').value,
        inputId: getField('inputId').value,
        dimming: Math.max(0, Math.min(92, Number(getField('dimming').value) || 0)),
        blur: Math.max(0, Math.min(20, Number(getField('blur').value) || 0)),
        glassOpacity: Math.max(20, Math.min(92, Number(getField('glassOpacity').value) || 44)),
        pet: {
          ...(basePatch.pet || cfg.pet || { size: 88, opacity: 96, mode: 'float', showSpeechOnClick: true }),
          enabled: Boolean(selectedPetId),
          id: selectedPetId
        }
      };
      const savedBundle = {
        id: draft.id,
        name: (getField('name').value || '').trim() || draft.name,
        badge: (getField('badge').value || '').trim() || (lang === 'en' ? 'Custom' : 'Tuỳ chỉnh'),
        patch: nextPatch
      };
      const list = [...(this.getConfig().customBundles || [])];
      const idx = list.findIndex((b) => b.id === savedBundle.id);
      if (idx >= 0) list[idx] = savedBundle;
      else list.push(savedBundle);
      this.closeModal();
      this.onPatch({ customBundles: list });
    });
  }

  resolveThumb(key, fullUrl) {
    if (!fullUrl) return '';
    if (fullUrl.length < 120000) return fullUrl;
    const cached = this.thumbCache.get(key);
    if (cached && cached.srcLen === fullUrl.length) return cached.thumbUrl;
    if (!cached || cached.pending !== fullUrl.length) {
      this.thumbCache.set(key, { srcLen: fullUrl.length, thumbUrl: '', pending: fullUrl.length });
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 220;
          canvas.height = 124;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, 220, 124);
          const thumbUrl = canvas.toDataURL('image/jpeg', 0.72);
          this.thumbCache.set(key, { srcLen: fullUrl.length, thumbUrl });
          const el = this.root.querySelector(`[data-thumb-key="${CSS.escape(key)}"]`);
          if (el) el.style.backgroundImage = `url('${thumbUrl}')`;
        } catch {
          // Ignore canvas errors
        }
      };
      img.src = fullUrl;
    }
    return '';
  }

  render() {
    const cfg = this.getConfig();
    const customMedia = this.getCustomMedia();
    const lang = cfg.lang === 'en' ? 'en' : 'vi';
    const t = I18N[lang];
    const slotMap = SLOT_LABELS[lang];
    const parentScroll = this.root.parentElement?.scrollTop || 0;

    const hiddenWps = new Set(cfg.hiddenWallpapers || []);
    const hiddenStickers = new Set(cfg.hiddenStickers || []);
    const hiddenPets = new Set(cfg.hiddenPets || []);
    const visibleWallpapers = WALLPAPERS.filter((wp) => wp.id === 'none' || !hiddenWps.has(wp.id));
    const visibleStickers = Object.entries(STICKER_TEMPLATES).filter(([id]) => !hiddenStickers.has(id));
    const petList = Object.entries(MASCOT_TEMPLATES).filter(
      ([id, m]) => m.role.includes('pet') && !hiddenPets.has(id)
    );

    this.root.innerHTML = `
      <div class="agy-ct-header-bar">
        <div class="agy-ct-title-wrap">
          <h2>✨ ${escapeHtml(t.title)}</h2>
          <p>${escapeHtml(t.subtitle)}</p>
        </div>
        <div class="agy-ct-actions-row">
          <label class="agy-ct-switch">
            <input type="checkbox" data-act="toggle-enabled" ${cfg.enabled ? 'checked' : ''} />
            <span>${escapeHtml(t.enableTheme)}</span>
          </label>
          <button type="button" class="agy-ct-btn" data-act="clear-ram">${escapeHtml(this.ramToast ? t.clearRamDone : t.clearRamBtn)}</button>
          <button type="button" class="agy-ct-btn" data-act="toggle-lang">${lang === 'vi' ? 'EN' : 'VI'}</button>
          <button type="button" class="agy-ct-btn" data-act="export-json">${escapeHtml(t.exportBtn)}</button>
          <button type="button" class="agy-ct-btn" data-act="import-json">${escapeHtml(t.importBtn)}</button>
          <button type="button" class="agy-ct-btn" data-act="reset-all">${escapeHtml(t.resetBtn)}</button>
        </div>
      </div>

      <!-- User Custom Theme Packs (Zero Pinned Presets) -->
      <div class="agy-ct-section">
        <div class="agy-ct-section-head" style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <h3>${escapeHtml(t.bundlesTitle)}</h3>
            <p>${escapeHtml(t.bundlesSub)}</p>
          </div>
          <button type="button" class="agy-ct-btn agy-ct-btn-accent" data-act="create-bundle">${escapeHtml(t.saveBundleBtn)}</button>
        </div>
        ${
          (cfg.customBundles || []).length > 0
            ? `
          <div class="agy-ct-bundle-grid">
            ${(cfg.customBundles || [])
              .map(
                (b) => `
              <div role="button" tabindex="0" class="agy-ct-bundle-card" data-act="apply-bundle" data-id="${escapeHtml(b.id)}">
                <div class="agy-ct-bundle-top">
                  <span class="agy-ct-bundle-badge">${escapeHtml(b.badge || (lang === 'en' ? 'Custom' : 'Tuỳ chỉnh'))}</span>
                </div>
                <span class="agy-ct-bundle-title">${escapeHtml(b.name)}</span>
                <span class="agy-ct-bundle-sub">${escapeHtml(this.summarizeBundle(b, lang))}</span>
                <div class="agy-ct-bundle-actions">
                  <button type="button" class="agy-ct-mini-btn" data-act="edit-bundle" data-id="${escapeHtml(b.id)}">✏️ ${lang === 'en' ? 'Customize' : 'Tuỳ chỉnh'}</button>
                  <button type="button" class="agy-ct-mini-btn agy-ct-mini-btn--danger" data-act="delete-bundle" data-id="${escapeHtml(b.id)}">✕ ${lang === 'en' ? 'Delete' : 'Xoá'}</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : `<div class="agy-ct-empty-hint">${escapeHtml(t.bundlesEmpty)}</div>`
        }
      </div>

      <!-- Wallpaper & Readability -->
      <div class="agy-ct-section">
        <div class="agy-ct-section-head" style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <h3>${escapeHtml(t.wpTitle)}</h3>
            <p>${escapeHtml(t.wpSub)}</p>
          </div>
        </div>
        <div class="agy-ct-wp-grid">
          ${visibleWallpapers.map((wp) => {
            const fullUrl = resolveWallpaperUrl(wp, customMedia);
            const thumbUrl = this.resolveThumb(`wp:${wp.id}`, fullUrl);
            const selected = cfg.wallpaperId === wp.id;
            return `
              <div role="button" tabindex="0" class="agy-ct-wp-card ${selected ? 'is-selected' : ''}" data-act="select-wp" data-id="${wp.id}">
                ${
                  wp.id !== 'none'
                    ? `<button type="button" class="agy-ct-card-del" data-act="delete-wp" data-id="${wp.id}" title="Xoá vĩnh viễn ảnh nền">✕</button>`
                    : ''
                }
                <div class="agy-ct-wp-thumb" data-thumb-key="wp:${wp.id}" style="${thumbUrl ? `background-image:url('${escapeHtml(thumbUrl)}')` : ''}">
                  ${fullUrl ? (thumbUrl ? '' : '<span>⏳</span>') : '<span>Clean Dark</span>'}
                </div>
                <div class="agy-ct-wp-meta">
                  <span>${escapeHtml(lang === 'en' ? wp.nameEn : wp.name)}</span>
                  ${selected ? '<span class="agy-ct-check">✓</span>' : ''}
                </div>
              </div>
            `;
          }).join('')}
          ${(() => {
            const customWallpapers = this.getCustomWallpapersList();
            return customWallpapers
              .map((cWp) => {
                const cDataUrl = customMedia[cWp.id] || (cWp.id === 'custom' ? customMedia.wallpaper : '');
                if (!cDataUrl) return '';
                const customThumb = this.resolveThumb(`wp:${cWp.id}`, cDataUrl);
                const isSelected = cfg.wallpaperId === cWp.id || (cWp.id === 'custom' && cfg.wallpaperId === 'custom');
                const displayName = cWp.name || (lang === 'en' ? 'Custom Image' : 'Ảnh tải lên');
                return `
              <div role="button" tabindex="0" class="agy-ct-wp-card ${isSelected ? 'is-selected' : ''}" data-act="select-wp" data-id="${escapeHtml(cWp.id)}">
                <button type="button" class="agy-ct-card-del" data-act="delete-wp" data-id="${escapeHtml(cWp.id)}" title="${lang === 'en' ? 'Delete custom wallpaper' : 'Xoá ảnh tải lên khỏi bộ nhớ'}">✕</button>
                <div class="agy-ct-wp-thumb" data-thumb-key="wp:${escapeHtml(cWp.id)}" style="${customThumb ? `background-image:url('${escapeHtml(customThumb)}')` : ''}"></div>
                <div class="agy-ct-wp-meta">
                  <span title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</span>
                  ${isSelected ? '<span class="agy-ct-check">✓</span>' : ''}
                </div>
              </div>
            `;
              })
              .join('');
          })()}
          <button type="button" class="agy-ct-wp-card" data-act="upload-wp">
            <div class="agy-ct-wp-thumb"><span>📁 +</span></div>
            <div class="agy-ct-wp-meta"><span>${escapeHtml(t.uploadWp)}</span></div>
          </button>
        </div>

        <div class="agy-ct-controls-box">
          <div class="agy-ct-slider-row">
            <div class="agy-ct-slider-label">
              <strong>${escapeHtml(t.dimLabel)}</strong>
              <span>${escapeHtml(t.dimDesc)}</span>
            </div>
            <input type="range" class="agy-ct-range" min="0" max="92" value="${cfg.dimming}" data-slider="dimming" />
            <span class="agy-ct-range-val" data-slider-val="dimming">${cfg.dimming}%</span>
          </div>
          <div class="agy-ct-slider-row">
            <div class="agy-ct-slider-label">
              <strong>${escapeHtml(t.blurLabel)}</strong>
              <span>${escapeHtml(t.blurDesc)}</span>
            </div>
            <input type="range" class="agy-ct-range" min="0" max="20" value="${cfg.blur}" data-slider="blur" />
            <span class="agy-ct-range-val" data-slider-val="blur">${cfg.blur}px</span>
          </div>
          <div class="agy-ct-slider-row">
            <div class="agy-ct-slider-label">
              <strong>${escapeHtml(t.glassLabel)}</strong>
              <span>${escapeHtml(t.glassDesc)}</span>
            </div>
            <input type="range" class="agy-ct-range" min="20" max="92" value="${cfg.glassOpacity}" data-slider="glassOpacity" />
            <span class="agy-ct-range-val" data-slider-val="glassOpacity">${cfg.glassOpacity}%</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:4px;">
            <strong style="font-size:13px;font-weight:500;">${escapeHtml(t.wpFitLabel)}</strong>
            <div class="agy-ct-chip-row">
              <button type="button" class="agy-ct-chip ${(cfg.wallpaperFit || 'cover') === 'cover' ? 'is-selected' : ''}" data-act="set-wp-fit" data-fit="cover">${escapeHtml(t.wpFitCover)}</button>
              <button type="button" class="agy-ct-chip ${cfg.wallpaperFit === 'contain' ? 'is-selected' : ''}" data-act="set-wp-fit" data-fit="contain">${escapeHtml(t.wpFitContain)}</button>
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:4px;">
            <strong style="font-size:13px;font-weight:500;">${escapeHtml(t.accentLabel)}</strong>
            <div style="display:flex;gap:8px;align-items:center;">
              ${ACCENT_COLORS.map(
                (c) => `
                <button type="button" class="agy-ct-swatch ${cfg.accentColor === c.hex ? 'is-selected' : ''}" style="background:${c.hex}" title="${escapeHtml(c.name)}" data-act="set-accent" data-hex="${c.hex}"></button>
              `
              ).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Ambient Atmosphere -->
      <div class="agy-ct-section">
        <div class="agy-ct-section-head">
          <h3>${escapeHtml(t.atmoTitle)}</h3>
          <p>${escapeHtml(t.atmoSub)}</p>
        </div>
        <div class="agy-ct-chip-row">
          ${ATMOSPHERE_PRESETS.map(
            (a) => `
            <button type="button" class="agy-ct-chip ${cfg.atmosphereId === a.id ? 'is-selected' : ''}" data-act="select-atmo" data-id="${a.id}" title="${escapeHtml(lang === 'en' ? a.descEn : a.desc)}">
              ${escapeHtml(lang === 'en' ? a.nameEn : a.name)}
            </button>
          `
          ).join('')}
        </div>
        ${
          cfg.atmosphereId !== 'none'
            ? `
          <div class="agy-ct-controls-box">
            <div class="agy-ct-slider-row">
              <div class="agy-ct-slider-label"><strong>${escapeHtml(t.atmoIntensity)}</strong></div>
              <input type="range" class="agy-ct-range" min="15" max="100" value="${cfg.atmosphereIntensity}" data-slider="atmosphereIntensity" />
              <span class="agy-ct-range-val" data-slider-val="atmosphereIntensity">${cfg.atmosphereIntensity}%</span>
            </div>
          </div>
        `
            : ''
        }
      </div>

      <!-- Chat Bubbles (Matches Image 1) -->
      <div class="agy-ct-section">
        <div class="agy-ct-section-head" style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <h3>${escapeHtml(t.bubbleTitle)}</h3>
            <p>${escapeHtml(t.bubbleSub)}</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <label class="agy-ct-switch">
              <input type="checkbox" data-act="toggle-bubble-mascot" ${cfg.bubbleMascotEnabled ? 'checked' : ''} />
              <span>${escapeHtml(t.bubbleMascot)}</span>
            </label>
            <button type="button" class="agy-ct-btn" data-act="clear-bubble">${escapeHtml(t.clearBubbleBtn)}</button>
          </div>
        </div>
        <div class="agy-ct-bubble-grid">
          ${BUBBLE_PRESETS.map((b) => {
            const selected = cfg.bubbleId === b.id;
            const mascotHtml =
              cfg.bubbleMascotEnabled && b.mascotId
                ? `<div class="agy-ct-bubble-mascot agy-ct-bubble-mascot--${b.mascotAlign || 'right-top'}">${renderMascotSvg(b.mascotId, 'bubble')}</div>`
                : '';
            const scrollHtml = b.scrollCaps
              ? `<span style="position:absolute;left:-5px;top:-3px;bottom:-3px;width:8px;border-radius:4px;background:linear-gradient(180deg,#b88a44,#5c3a14 50%,#b88a44);border:1px solid #2e1b08;"></span>
                 <span style="position:absolute;right:-5px;top:-3px;bottom:-3px;width:8px;border-radius:4px;background:linear-gradient(180deg,#b88a44,#5c3a14 50%,#b88a44);border:1px solid #2e1b08;"></span>`
              : '';
            return `
              <button type="button" class="agy-ct-bubble-card ${selected ? 'is-selected' : ''}" data-act="select-bubble" data-id="${b.id}">
                <div class="agy-ct-preview-bubble-wrap">
                  <div class="agy-ct-preview-bubble" style="background:${escapeHtml(b.bg)};border:${escapeHtml(b.border)};color:${escapeHtml(b.text)};box-shadow:${escapeHtml(b.shadow)};border-radius:${escapeHtml(b.radius)};">
                    ${scrollHtml}
                    ${mascotHtml}
                    <span>Xin chào ✨</span>
                    ${b.sparkle ? `<span style="margin-left:auto;font-size:10px;color:${b.sparkle};">✦</span>` : ''}
                  </div>
                </div>
                <div class="agy-ct-card-footer">
                  <span>${escapeHtml(lang === 'en' ? b.nameEn : b.name)}</span>
                  ${selected ? '<span class="agy-ct-check">✓</span>' : ''}
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- AI Response Glass Card -->
      <div class="agy-ct-section">
        <div class="agy-ct-section-head" style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <h3>${escapeHtml(t.aiCardTitle)}</h3>
            <p>${escapeHtml(t.aiCardSub)}</p>
          </div>
          <div>
            <label class="agy-ct-switch">
              <input type="checkbox" data-act="toggle-ai-card" ${(cfg.aiCard?.enabled ?? true) ? 'checked' : ''} />
              <span>${escapeHtml(t.aiCardToggle)}</span>
            </label>
          </div>
        </div>
        ${
          (cfg.aiCard?.enabled ?? true)
            ? `
          <div class="agy-ct-controls-box" style="margin-top:12px;">
            <div class="agy-ct-slider-row">
              <div class="agy-ct-slider-label"><strong>${escapeHtml(t.aiCardOpacity)}</strong></div>
              <input type="range" class="agy-ct-range" min="30" max="98" value="${cfg.aiCard?.opacity ?? 82}" data-slider="aiCard.opacity" />
              <span class="agy-ct-range-val" data-slider-val="aiCard.opacity">${cfg.aiCard?.opacity ?? 82}%</span>
            </div>
            <div class="agy-ct-slider-row">
              <div class="agy-ct-slider-label"><strong>${escapeHtml(t.aiCardBlur)}</strong></div>
              <input type="range" class="agy-ct-range" min="0" max="28" value="${cfg.aiCard?.blur ?? 16}" data-slider="aiCard.blur" />
              <span class="agy-ct-range-val" data-slider-val="aiCard.blur">${cfg.aiCard?.blur ?? 16}px</span>
            </div>
          </div>
        `
            : ''
        }
      </div>

      <!-- Chat Input Box (Matches Image 1) -->
      <div class="agy-ct-section">
        <div class="agy-ct-section-head">
          <h3>${escapeHtml(t.inputTitle)}</h3>
          <p>${escapeHtml(t.inputSub)}</p>
        </div>
        <div class="agy-ct-input-grid">
          ${INPUT_PRESETS.map((inp) => {
            const selected = cfg.inputId === inp.id;
            return `
              <button type="button" class="agy-ct-input-card ${selected ? 'is-selected' : ''}" data-act="select-input" data-id="${inp.id}">
                <div class="agy-ct-input-mock" style="background:${escapeHtml(inp.bg)};border:${escapeHtml(inp.border)};border-radius:${escapeHtml(inp.radius)};box-shadow:${escapeHtml(inp.shadow)};">
                  Ask anything, @ to mention...
                </div>
                <div class="agy-ct-card-footer">
                  <span>${escapeHtml(lang === 'en' ? inp.nameEn : inp.name)}</span>
                  ${selected ? '<span class="agy-ct-check">✓</span>' : ''}
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Stickers -->
      <div class="agy-ct-section">
        <div class="agy-ct-section-head" style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <h3>${escapeHtml(t.stickerTitle)}</h3>
            <p>${escapeHtml(t.stickerSub)}</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <label class="agy-ct-switch">
              <input type="checkbox" data-act="toggle-stickers" ${cfg.stickers?.enabled ? 'checked' : ''} />
              <span>${escapeHtml(t.enableStickers)}</span>
            </label>
            <button type="button" class="agy-ct-btn" data-act="upload-sticker">${escapeHtml(t.uploadSticker)}</button>
            ${
              (cfg.stickers?.items || []).length > 0
                ? `<button type="button" class="agy-ct-btn" data-act="clear-all-stickers">${escapeHtml(t.clearStickersBtn)}</button>`
                : ''
            }
          </div>
        </div>

        <div class="agy-ct-asset-grid">
          ${visibleStickers
            .map(([id, st]) => {
              const active = (cfg.stickers?.items || []).some((it) => it.id === id);
              return `
                <div role="button" tabindex="0" class="agy-ct-asset-card ${active ? 'is-selected' : ''}" data-act="toggle-sticker-item" data-id="${id}">
                  <button type="button" class="agy-ct-card-del" data-act="delete-sticker-asset" data-id="${id}" title="Xoá vĩnh viễn sticker">✕</button>
                  <div class="agy-ct-asset-icon">${renderStickerSvg(id)}</div>
                  <span class="agy-ct-asset-name">${escapeHtml(lang === 'en' ? st.nameEn : st.name)}</span>
                </div>
              `;
            })
            .join('')}
          ${
            customMedia.sticker
              ? `
              <div role="button" tabindex="0" class="agy-ct-asset-card ${(cfg.stickers?.items || []).some((it) => it.id === 'custom') ? 'is-selected' : ''}" data-act="toggle-sticker-item" data-id="custom">
                <button type="button" class="agy-ct-card-del" data-act="delete-sticker-asset" data-id="custom" title="Xoá sticker tải lên">✕</button>
                <div class="agy-ct-asset-icon"><img src="${escapeHtml(customMedia.sticker)}" alt="Custom sticker" /></div>
                <span class="agy-ct-asset-name">Custom Sticker</span>
              </div>
            `
              : ''
          }
        </div>

        ${
          (cfg.stickers?.items || []).length > 0
            ? `
          <div class="agy-ct-controls-box">
            <strong style="font-size:12.5px;">${escapeHtml(t.activeStickers)} (${cfg.stickers.items.length})</strong>
            ${cfg.stickers.items
              .map((it, idx) => {
                const stName =
                  it.id === 'custom'
                    ? 'Custom Sticker'
                    : lang === 'en'
                    ? STICKER_TEMPLATES[it.id]?.nameEn || it.id
                    : STICKER_TEMPLATES[it.id]?.name || it.id;
                return `
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:12.5px;min-width:120px;">${escapeHtml(stName)}</span>
                    <select class="agy-ct-select" data-act="sticker-slot" data-idx="${idx}">
                      ${Object.entries(slotMap)
                        .map(
                          ([slotKey, slotLabel]) =>
                            `<option value="${slotKey}" ${it.slot === slotKey ? 'selected' : ''}>${escapeHtml(slotLabel)}</option>`
                        )
                        .join('')}
                    </select>
                    <input type="range" class="agy-ct-range" style="width:96px;" min="30" max="110" value="${it.size || 52}" data-sticker-size="${idx}" />
                    <button type="button" class="agy-ct-btn" data-act="remove-sticker" data-idx="${idx}">✕</button>
                  </div>
                `;
              })
              .join('')}
          </div>
        `
            : ''
        }
      </div>

      <!-- Interactive Pet -->
      <div class="agy-ct-section">
        <div class="agy-ct-section-head" style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <h3>${escapeHtml(t.petTitle)}</h3>
            <p>${escapeHtml(t.petSub)}</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <label class="agy-ct-switch">
              <input type="checkbox" data-act="toggle-pet" ${cfg.pet?.enabled ? 'checked' : ''} />
              <span>${escapeHtml(t.enablePet)}</span>
            </label>
            <button type="button" class="agy-ct-btn" data-act="upload-pet">${escapeHtml(t.uploadPet)}</button>
            ${
              cfg.pet?.enabled
                ? `<button type="button" class="agy-ct-btn" data-act="disable-pet">${escapeHtml(t.disablePetBtn)}</button>`
                : ''
            }
          </div>
        </div>

        <div class="agy-ct-asset-grid">
          ${petList
            .map(([id, m]) => {
              const selected = cfg.pet?.id === id;
              return `
                <div role="button" tabindex="0" class="agy-ct-asset-card ${selected ? 'is-selected' : ''}" data-act="select-pet" data-id="${id}">
                  <button type="button" class="agy-ct-card-del" data-act="delete-pet-asset" data-id="${id}" title="Xoá vĩnh viễn Pet">✕</button>
                  <div class="agy-ct-asset-icon">${renderMascotSvg(id, 'pet')}</div>
                  <span class="agy-ct-asset-name">${escapeHtml(lang === 'en' ? m.nameEn : m.name)}</span>
                </div>
              `;
            })
            .join('')}
          ${
            customMedia.pet
              ? `
              <div role="button" tabindex="0" class="agy-ct-asset-card ${cfg.pet?.id === 'custom' ? 'is-selected' : ''}" data-act="select-pet" data-id="custom">
                <button type="button" class="agy-ct-card-del" data-act="delete-pet-asset" data-id="custom" title="Xoá Pet tải lên">✕</button>
                <div class="agy-ct-asset-icon"><img src="${escapeHtml(customMedia.pet)}" alt="Custom Pet" /></div>
                <span class="agy-ct-asset-name">Custom Pet</span>
              </div>
            `
              : ''
          }
        </div>

        <div class="agy-ct-controls-box">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <strong style="font-size:13px;font-weight:500;">${escapeHtml(t.petMode)}</strong>
            <div class="agy-ct-chip-row">
              ${[
                ['float', lang === 'en' ? 'Float' : 'Lơ lửng tại chỗ'],
                ['roam', lang === 'en' ? 'Roam' : 'Đi dạo tự do'],
                ['follow', lang === 'en' ? 'Follow Cursor' : 'Theo chuột nhẹ']
              ]
                .map(
                  ([mode, label]) => `
                  <button type="button" class="agy-ct-chip ${cfg.pet?.mode === mode ? 'is-selected' : ''}" data-act="pet-mode" data-mode="${mode}">${label}</button>
                `
                )
                .join('')}
            </div>
          </div>

          <div class="agy-ct-slider-row">
            <div class="agy-ct-slider-label"><strong>${escapeHtml(t.petSize)}</strong></div>
            <input type="range" class="agy-ct-range" min="48" max="150" value="${cfg.pet?.size || 88}" data-slider="pet.size" />
            <span class="agy-ct-range-val" data-slider-val="pet.size">${cfg.pet?.size || 88}px</span>
          </div>

          <div class="agy-ct-slider-row">
            <div class="agy-ct-slider-label"><strong>${escapeHtml(t.petOpacity)}</strong></div>
            <input type="range" class="agy-ct-range" min="25" max="100" value="${cfg.pet?.opacity ?? 96}" data-slider="pet.opacity" />
            <span class="agy-ct-range-val" data-slider-val="pet.opacity">${cfg.pet?.opacity ?? 96}%</span>
          </div>

          <label class="agy-ct-switch">
            <input type="checkbox" data-act="toggle-pet-speech" ${cfg.pet?.showSpeechOnClick ? 'checked' : ''} />
            <span>${escapeHtml(t.petSpeech)}</span>
          </label>
        </div>
      </div>

      <!-- Advanced & DOM Picker -->
      <div class="agy-ct-section">
        <div class="agy-ct-section-head">
          <h3>${escapeHtml(t.advTitle)}</h3>
          <p>${escapeHtml(t.advSub)}</p>
        </div>
        <div class="agy-ct-actions-row">
          <button type="button" class="agy-ct-btn" data-act="pick-dom" data-target="chatBubble" data-label="Bong bóng chat">${escapeHtml(t.pickBubble)}</button>
          <button type="button" class="agy-ct-btn" data-act="pick-dom" data-target="aiResponse" data-label="Câu trả lời AI">${escapeHtml(t.pickAiResponse)}</button>
          <button type="button" class="agy-ct-btn" data-act="pick-dom" data-target="chatInput" data-label="Khung nhập chat">${escapeHtml(t.pickInput)}</button>
          <button type="button" class="agy-ct-btn" data-act="pick-dom" data-target="sidebar" data-label="Sidebar">${escapeHtml(t.pickSidebar)}</button>
          <button type="button" class="agy-ct-btn" data-act="clear-selectors">${escapeHtml(t.clearSelectors)}</button>
        </div>
      </div>
    `;

    if (this.root.parentElement) {
      this.root.parentElement.scrollTop = parentScroll;
    }
  }

  bindRootEvents() {
    this.root.addEventListener('click', (e) => {
      const target = e.target.closest('[data-act]');
      if (!target) return;
      const act = target.dataset.act;
      const cfg = this.getConfig();

      if (act === 'toggle-lang') {
        this.onPatch({ lang: cfg.lang === 'en' ? 'vi' : 'en' });
      } else if (act === 'clear-ram') {
        this.thumbCache.clear();
        this.ramToast = true;
        this.onClearRam?.();
        setTimeout(() => {
          this.ramToast = false;
          if (this.isOpen()) this.render();
        }, 1800);
      } else if (act === 'create-bundle') {
        this.openBundleEditor(null);
      } else if (act === 'edit-bundle') {
        e.stopPropagation();
        const found = (cfg.customBundles || []).find((b) => b.id === target.dataset.id);
        if (found) this.openBundleEditor(found);
      } else if (act === 'delete-bundle') {
        e.stopPropagation();
        const id = target.dataset.id;
        const found = (cfg.customBundles || []).find((b) => b.id === id);
        if (!found) return;
        const lang = cfg.lang === 'en' ? 'en' : 'vi';
        this.requestConfirm({
          title: lang === 'en' ? 'Confirm Delete Pack' : 'Xác nhận xoá gói chủ đề',
          message:
            lang === 'en'
              ? `Delete custom pack "${found.name}"?`
              : `Bạn có chắc muốn xoá vĩnh viễn gói "${found.name}" không?`,
          note: I18N[lang].confirmPermanentNote,
          onConfirm: () => {
            const freshCfg = this.getConfig();
            const nextBundles = (freshCfg.customBundles || []).filter((b) => b.id !== id);
            this.onPatch({ customBundles: nextBundles });
          }
        });
      } else if (act === 'apply-bundle') {
        this.onBundleApply(target.dataset.id);
      } else if (act === 'select-wp') {
        this.onPatch({ wallpaperId: target.dataset.id });
      } else if (act === 'set-wp-fit') {
        this.onPatch({ wallpaperFit: target.dataset.fit === 'contain' ? 'contain' : 'cover' });
      } else if (act === 'delete-wp') {
        e.stopPropagation();
        const id = target.dataset.id;
        const lang = cfg.lang === 'en' ? 'en' : 'vi';
        const isCustom = id === 'custom' || id.startsWith('custom-');
        const customWp = isCustom ? this.getCustomWallpapersList().find((w) => w.id === id) : null;
        const wpObj = WALLPAPERS.find((w) => w.id === id);
        const wpName = isCustom ? (customWp?.name || 'Custom Image') : (lang === 'en' ? wpObj?.nameEn : wpObj?.name) || id;
        this.requestConfirm({
          title: lang === 'en' ? 'Confirm Delete Wallpaper' : 'Phê duyệt xoá ảnh nền',
          message:
            lang === 'en'
              ? `Permanently delete wallpaper "${wpName}"?`
              : `Bạn có chắc muốn xoá vĩnh viễn ảnh nền "${wpName}" không?`,
          note: I18N[lang].confirmPermanentNote,
          onConfirm: () => {
            const freshCfg = this.getConfig();
            if (isCustom) {
              this.thumbCache.delete(`wp:${id}`);
              if (id === 'custom') {
                this.thumbCache.delete('wp:custom');
                this.onDeleteMedia?.('wallpaper');
              }
              this.onDeleteMedia?.(id);

              const nextCustomWps = (freshCfg.customWallpapers || []).filter((w) => w.id !== id);
              const patch = { customWallpapers: nextCustomWps };
              if (freshCfg.wallpaperId === id || (id === 'custom' && freshCfg.wallpaperId === 'custom')) {
                patch.wallpaperId = nextCustomWps.length > 0 ? nextCustomWps[nextCustomWps.length - 1].id : 'none';
              }
              this.onPatch(patch);
            } else {
              this.thumbCache.delete(`wp:${id}`);
              const hidden = Array.from(new Set([...(freshCfg.hiddenWallpapers || []), id]));
              const patch = { hiddenWallpapers: hidden };
              if (freshCfg.wallpaperId === id) patch.wallpaperId = 'none';
              this.onPatch(patch);
            }
          }
        });
      } else if (act === 'clear-bubble') {
        this.onPatch({ bubbleId: 'none', bubbleMascotEnabled: false });
      } else if (act === 'clear-all-stickers') {
        const lang = cfg.lang === 'en' ? 'en' : 'vi';
        this.requestConfirm({
          title: lang === 'en' ? 'Confirm Clear Stickers' : 'Phê duyệt xoá hết sticker',
          message:
            lang === 'en'
              ? 'Remove all active stickers currently displayed on screen?'
              : 'Bạn có chắc muốn gỡ toàn bộ sticker đang bật khỏi màn hình không?',
          note:
            lang === 'en'
              ? 'Your sticker templates stay in the list so you can re-enable them later.'
              : 'Các mẫu sticker trong danh sách vẫn giữ nguyên để bạn bật lại sau nếu cần.',
          onConfirm: () => this.onPatch({ stickers: { enabled: false, items: [] } })
        });
      } else if (act === 'delete-sticker-asset') {
        e.stopPropagation();
        const id = target.dataset.id;
        const lang = cfg.lang === 'en' ? 'en' : 'vi';
        const stObj = STICKER_TEMPLATES[id];
        const stName = id === 'custom' ? 'Custom Sticker' : (lang === 'en' ? stObj?.nameEn : stObj?.name) || id;
        this.requestConfirm({
          title: lang === 'en' ? 'Confirm Delete Sticker' : 'Phê duyệt xoá sticker',
          message:
            lang === 'en'
              ? `Permanently delete sticker "${stName}"?`
              : `Bạn có chắc muốn xoá vĩnh viễn sticker "${stName}" không?`,
          note: I18N[lang].confirmPermanentNote,
          onConfirm: () => {
            const freshCfg = this.getConfig();
            const items = (freshCfg.stickers?.items || []).filter((it) => it.id !== id);
            if (id === 'custom') {
              this.onDeleteMedia?.('sticker');
              this.onPatch({ stickers: { items } });
            } else {
              const hidden = Array.from(new Set([...(freshCfg.hiddenStickers || []), id]));
              this.onPatch({ hiddenStickers: hidden, stickers: { items } });
            }
          }
        });
      } else if (act === 'disable-pet') {
        const lang = cfg.lang === 'en' ? 'en' : 'vi';
        this.requestConfirm({
          title: lang === 'en' ? 'Confirm Disable Pet' : 'Phê duyệt tắt Pet',
          message:
            lang === 'en'
              ? 'Hide and disable the active Pet on screen?'
              : 'Bạn có chắc muốn tắt Pet đang hiển thị trên màn hình không?',
          onConfirm: () => this.onPatch({ pet: { enabled: false } })
        });
      } else if (act === 'delete-pet-asset') {
        e.stopPropagation();
        const id = target.dataset.id;
        const lang = cfg.lang === 'en' ? 'en' : 'vi';
        const petObj = MASCOT_TEMPLATES[id];
        const petName = id === 'custom' ? 'Custom Pet' : (lang === 'en' ? petObj?.nameEn : petObj?.name) || id;
        this.requestConfirm({
          title: lang === 'en' ? 'Confirm Delete Pet' : 'Phê duyệt xoá Pet',
          message:
            lang === 'en'
              ? `Permanently delete Pet "${petName}"?`
              : `Bạn có chắc muốn xoá vĩnh viễn Pet "${petName}" không?`,
          note: I18N[lang].confirmPermanentNote,
          onConfirm: () => {
            const freshCfg = this.getConfig();
            if (id === 'custom') {
              this.onDeleteMedia?.('pet');
              if (freshCfg.pet?.id === 'custom') {
                this.onPatch({ pet: { enabled: false, id: 'loi-kiem' } });
              }
            } else {
              const hidden = Array.from(new Set([...(freshCfg.hiddenPets || []), id]));
              const patch = { hiddenPets: hidden };
              if (freshCfg.pet?.id === id) patch.pet = { enabled: false, id: '' };
              this.onPatch(patch);
            }
          }
        });
      } else if (act === 'upload-wp') {
        this.promptFileUpload('wallpaper', (dataUrl, fileName) => {
          const freshCfg = this.getConfig();
          const customMedia = this.getCustomMedia();
          const wpId = `custom-wp-${Date.now()}`;
          const cleanName = fileName ? fileName.replace(/\.[^/.]+$/, '').trim().slice(0, 36) : '';
          const lang = freshCfg.lang === 'en' ? 'en' : 'vi';
          const defaultName = lang === 'en' ? 'Custom Image' : 'Ảnh tải lên';
          const finalName = cleanName || defaultName;

          this.onUploadMedia(wpId, dataUrl);

          const customWallpapers = Array.isArray(freshCfg.customWallpapers) ? [...freshCfg.customWallpapers] : [];
          // Preserve existing legacy 'custom' if present
          if ((customMedia.wallpaper || customMedia.custom) && !customWallpapers.some((w) => w.id === 'custom')) {
            customWallpapers.unshift({ id: 'custom', name: 'Custom Image' });
          }
          customWallpapers.push({ id: wpId, name: finalName, createdAt: Date.now() });

          this.onPatch({
            customWallpapers,
            wallpaperId: wpId
          });
        });
      } else if (act === 'upload-sticker') {
        this.promptFileUpload('sticker', (dataUrl) => {
          this.onUploadMedia('sticker', dataUrl);
          const items = [...(cfg.stickers?.items || [])];
          if (!items.some((it) => it.id === 'custom')) {
            items.push({ id: 'custom', slot: 'input-top-right', size: 54, glow: true, opacity: 96 });
          }
          this.onPatch({ stickers: { enabled: true, items } });
        });
      } else if (act === 'upload-pet') {
        this.promptFileUpload('pet', (dataUrl) => {
          this.onUploadMedia('pet', dataUrl);
          this.onPatch({ pet: { enabled: true, id: 'custom' } });
        });
      } else if (act === 'set-accent') {
        this.onPatch({ accentColor: target.dataset.hex });
      } else if (act === 'select-atmo') {
        this.onPatch({ atmosphereId: target.dataset.id });
      } else if (act === 'select-bubble') {
        this.onPatch({ bubbleId: target.dataset.id });
      } else if (act === 'select-input') {
        this.onPatch({ inputId: target.dataset.id });
      } else if (act === 'select-pet') {
        this.onPatch({ pet: { enabled: true, id: target.dataset.id } });
      } else if (act === 'pet-mode') {
        this.onPatch({ pet: { mode: target.dataset.mode } });
      } else if (act === 'toggle-sticker-item') {
        const id = target.dataset.id;
        const items = [...(cfg.stickers?.items || [])];
        const idx = items.findIndex((it) => it.id === id);
        if (idx >= 0) {
          items.splice(idx, 1);
        } else {
          const slots = ['input-top-right', 'input-top-left', 'greeting-badge', 'sidebar-bottom-right'];
          const used = new Set(items.map((x) => x.slot));
          const freeSlot = slots.find((s) => !used.has(s)) || 'free';
          items.push({
            id,
            slot: freeSlot,
            size: 52,
            glow: true,
            opacity: 96,
            pos: { xPct: 70 + (items.length % 3) * 6, yPct: 35 + (items.length % 3) * 10 }
          });
        }
        this.onPatch({ stickers: { enabled: true, items } });
      } else if (act === 'remove-sticker') {
        const idx = Number(target.dataset.idx);
        const items = [...(cfg.stickers?.items || [])];
        items.splice(idx, 1);
        this.onPatch({ stickers: { items } });
      } else if (act === 'pick-dom') {
        this.onStartPicker(target.dataset.target, target.dataset.label);
      } else if (act === 'clear-selectors') {
        this.onPatch({
          customSelectors: {
            appShell: '',
            sidebar: '',
            mainCanvas: '',
            chatBubble: '',
            aiResponse: '',
            chatInput: '',
            settingsNavList: '',
            settingsContent: ''
          }
        });
      } else if (act === 'reset-all') {
        const lang = cfg.lang === 'en' ? 'en' : 'vi';
        this.requestConfirm({
          title: lang === 'en' ? 'Confirm Reset' : 'Phê duyệt đặt lại mặc định',
          message:
            lang === 'en'
              ? 'Reset visual settings to default?'
              : 'Khôi phục màu sắc, độ sáng, bong bóng, hiệu ứng về mặc định?',
          note:
            lang === 'en'
              ? 'Your custom packs and permanently deleted items remain preserved.'
              : 'Các gói chủ đề riêng và các mục bạn đã xoá vĩnh viễn vẫn được giữ nguyên.',
          confirmLabel: lang === 'en' ? 'Reset' : 'Đồng ý đặt lại',
          onConfirm: () => this.onReset()
        });
      } else if (act === 'export-json') {
        const json = JSON.stringify(cfg, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'antigravity-custom-theme.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (act === 'import-json') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            const txt = await file.text();
            const parsed = JSON.parse(txt);
            this.onPatch(parsed);
          } catch {
            // Ignore malformed json
          }
        };
        input.click();
      }
    });

    this.root.addEventListener('change', (e) => {
      const el = e.target;
      const act = el.dataset?.act;
      if (act === 'toggle-enabled') {
        this.onPatch({ enabled: Boolean(el.checked) });
      } else if (act === 'toggle-bubble-mascot') {
        this.onPatch({ bubbleMascotEnabled: Boolean(el.checked) });
      } else if (act === 'toggle-ai-card') {
        const curAi = this.getConfig().aiCard || {};
        this.onPatch({ aiCard: { ...curAi, enabled: Boolean(el.checked) } });
      } else if (act === 'toggle-stickers') {
        this.onPatch({ stickers: { enabled: Boolean(el.checked) } });
      } else if (act === 'toggle-pet') {
        this.onPatch({ pet: { enabled: Boolean(el.checked) } });
      } else if (act === 'toggle-pet-speech') {
        this.onPatch({ pet: { showSpeechOnClick: Boolean(el.checked) } });
      } else if (act === 'sticker-slot') {
        const idx = Number(el.dataset.idx);
        const items = [...(this.getConfig().stickers?.items || [])];
        if (items[idx]) {
          items[idx] = { ...items[idx], slot: el.value };
          this.onPatch({ stickers: { items } });
        }
      }
    });

    // Live slider handling without destroying DOM focus while dragging
    this.root.addEventListener('input', (e) => {
      const el = e.target;
      const key = el.dataset?.slider;
      if (key) {
        const num = Number(el.value);
        const labelEl = this.root.querySelector(`[data-slider-val="${key}"]`);
        if (labelEl) {
          const unit = key === 'blur' || key === 'pet.size' || key === 'aiCard.blur' ? 'px' : '%';
          labelEl.textContent = `${num}${unit}`;
        }
        if (key.startsWith('pet.')) {
          const sub = key.split('.')[1];
          this.onLiveUpdate({ pet: { [sub]: num } });
        } else if (key.startsWith('aiCard.')) {
          const sub = key.split('.')[1];
          this.onLiveUpdate({ aiCard: { [sub]: num } });
        } else {
          this.onLiveUpdate({ [key]: num });
        }
        return;
      }

      if (el.dataset?.stickerSize !== undefined) {
        const idx = Number(el.dataset.stickerSize);
        const items = [...(this.getConfig().stickers?.items || [])];
        if (items[idx]) {
          items[idx] = { ...items[idx], size: Number(el.value) };
          this.onLiveUpdate({ stickers: { items } });
        }
      }
    });
  }

  promptFileUpload(kind, onDone) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const dataUrl = await readFileAsDataUrl(file);
      if (dataUrl) onDone(dataUrl, file.name);
    };
    input.click();
  }
}
