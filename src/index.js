import {
  loadConfig,
  saveConfig,
  syncConfigToHost,
  resetConfig,
  mergeConfig,
  saveCustomMedia,
  deleteCustomMedia,
  clearAllCustomMedia,
  loadCustomMediaMap
} from './core/storage.js';
import { applyStylesheet, ensureBackgroundLayers, removeBackgroundLayers } from './core/styles.js';
import { AmbientCanvasEngine } from './core/ambient-canvas.js';
import { DomAdapter } from './core/dom-adapter.js';
import { PetStage } from './ui/pet-stage.js';
import { StickerLayer } from './ui/sticker-layer.js';
import { SettingsPanel } from './ui/settings-panel.js';
import { THEME_BUNDLES } from './presets/themes.js';

class CustomThemeInjector {
  constructor() {
    this.config = loadConfig();
    if (window.__AGY_CT_SELECTORS__ && typeof window.__AGY_CT_SELECTORS__ === 'object') {
      this.config = mergeConfig(this.config, { customSelectors: window.__AGY_CT_SELECTORS__ });
    }
    this.customMedia = {};
    this.ambient = null;
    this.petStage = null;
    this.stickerLayer = null;
    this.settingsPanel = null;
    this.domAdapter = null;
    this.initialized = false;
    this.initPromise = null;
    this.pendingOpenSettings = false;
    this.fallbackModal = null;
    this.launcherBtn = null;

    this.onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.openSettings();
      }
    };
  }

  async init() {
    if (this.initialized) return this.initPromise || this;
    this.initialized = true;

    const mount = async () => {
      this.customMedia = await loadCustomMediaMap();
      syncConfigToHost(this.config);
      const { canvas } = ensureBackgroundLayers();

      this.ambient = new AmbientCanvasEngine(canvas);

      this.settingsPanel = new SettingsPanel({
        getConfig: () => this.config,
        getCustomMedia: () => this.customMedia,
        onPatch: (patch) => this.updateConfig(patch, true),
        onLiveUpdate: (patch) => this.updateConfig(patch, false),
        onBundleApply: (bundleId) => this.applyBundle(bundleId),
        onReset: () => {
          this.config = resetConfig(this.config);
          this.refreshAll(true);
        },
        onUploadMedia: (key, dataUrl) => {
          this.customMedia[key] = dataUrl;
          saveCustomMedia(key, dataUrl);
          this.refreshAll(true);
        },
        onDeleteMedia: (key) => {
          delete this.customMedia[key];
          deleteCustomMedia(key);
          this.refreshAll(true);
        },
        onClearRam: () => {
          const activeWpId = this.config.wallpaperId;
          const customWpIds = new Set((this.config.customWallpapers || []).map((w) => w.id));
          if (activeWpId) customWpIds.add(activeWpId);

          const keepPet = this.config.pet?.enabled && this.config.pet?.id === 'custom';
          const keepSticker =
            this.config.stickers?.enabled &&
            (this.config.stickers?.items || []).some((it) => it.id === 'custom');

          for (const key of Object.keys(this.customMedia)) {
            if (key === 'pet') {
              if (!keepPet) {
                delete this.customMedia.pet;
                deleteCustomMedia('pet');
              }
            } else if (key === 'sticker') {
              if (!keepSticker) {
                delete this.customMedia.sticker;
                deleteCustomMedia('sticker');
              }
            } else if (key === 'wallpaper') {
              if (!customWpIds.has('custom') && activeWpId !== 'custom') {
                delete this.customMedia.wallpaper;
                deleteCustomMedia('wallpaper');
              }
            } else if (key.startsWith('custom-wp-') || key.startsWith('custom-')) {
              if (!customWpIds.has(key)) {
                delete this.customMedia[key];
                deleteCustomMedia(key);
              }
            }
          }
          this.refreshAll(true);
        },
        onStartPicker: (targetKey, labelText) => {
          this.domAdapter?.startVisualPicker(targetKey, labelText);
        }
      });

      this.domAdapter = new DomAdapter({
        getConfig: () => this.config,
        onCustomNavClick: () => {
          this.settingsPanel?.render();
        },
        onNativeNavClick: () => {
          this.settingsPanel?.clearView();
        },
        onConfigPatch: (patch) => this.updateConfig(patch, true)
      });
      this.domAdapter.setSettingsPanel(this.settingsPanel.getElement());

      this.petStage = new PetStage({
        getConfig: () => this.config,
        getCustomMedia: () => this.customMedia,
        onPositionSave: (pos) => this.updateConfig({ pet: { pos } }, false)
      });

      this.stickerLayer = new StickerLayer({
        getConfig: () => this.config,
        getCustomMedia: () => this.customMedia,
        findInputBox: () => this.domAdapter?.findChatInputContainers(this.config)[0] || null,
        onStickerMove: (idx, patch) => {
          const items = [...(this.config.stickers?.items || [])];
          if (items[idx]) {
            items[idx] = { ...items[idx], ...patch };
            this.updateConfig({ stickers: { items } }, true);
          }
        }
      });

      this.refreshAll(false);
      this.domAdapter.start();
      this.ensureLauncherButton();
      document.addEventListener('keydown', this.onKeyDown);
      if (this.pendingOpenSettings) {
        this.pendingOpenSettings = false;
        this.openSettings();
      }
    };

    if (document.readyState === 'loading') {
      this.initPromise = new Promise((resolve) => {
        document.addEventListener(
          'DOMContentLoaded',
          async () => {
            await mount();
            resolve(this);
          },
          { once: true }
        );
      });
      await this.initPromise;
    } else {
      this.initPromise = mount().then(() => this);
      await this.initPromise;
    }
    return this;
  }

  ensureLauncherButton() {
    if (this.launcherBtn && document.body.contains(this.launcherBtn)) return;
    const existing = document.getElementById('agy-ct-launcher');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.id = 'agy-ct-launcher';
    btn.type = 'button';
    btn.setAttribute('data-agy-ct-injected', 'true');
    btn.title = 'Mở cài đặt Custom theme (Cmd/Ctrl + Shift + Y)';
    btn.textContent = '🎨 Custom theme';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.fallbackModal?.overlay && document.body.contains(this.fallbackModal.overlay)) {
        this.closeFallbackModal();
      } else {
        this.openSettings();
      }
    });
    document.body.appendChild(btn);
    this.launcherBtn = btn;
  }

  updateConfig(patch, rerenderPanel = true) {
    this.config = mergeConfig(this.config, patch);
    saveConfig(this.config);
    this.refreshAll(rerenderPanel);
  }

  applyBundle(bundleId) {
    const customBundle = (this.config.customBundles || []).find((b) => b.id === bundleId);
    const bundle = customBundle || THEME_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) return;
    const patch = JSON.parse(JSON.stringify(bundle.patch || {}));
    const hiddenWps = new Set(this.config.hiddenWallpapers || []);
    const hiddenStickers = new Set(this.config.hiddenStickers || []);
    const hiddenPets = new Set(this.config.hiddenPets || []);
    const isCustomWp = patch.wallpaperId === 'custom' || patch.wallpaperId?.startsWith('custom-');
    const hasCustomWp =
      isCustomWp &&
      Boolean(
        this.customMedia[patch.wallpaperId] ||
          (patch.wallpaperId === 'custom' && (this.customMedia.custom || this.customMedia.wallpaper))
      );
    if (patch.wallpaperId && (hiddenWps.has(patch.wallpaperId) || (isCustomWp && !hasCustomWp))) {
      patch.wallpaperId = 'none';
    }
    if (patch.stickers?.items) {
      patch.stickers.items = patch.stickers.items.filter(
        (it) => !hiddenStickers.has(it.id) && (it.id !== 'custom' || Boolean(this.customMedia.sticker))
      );
    }
    if (patch.pet?.id && (hiddenPets.has(patch.pet.id) || (patch.pet.id === 'custom' && !this.customMedia.pet))) {
      patch.pet.enabled = false;
      patch.pet.id = '';
    }
    this.updateConfig({ ...patch, enabled: true }, true);
  }

  refreshAll(rerenderPanel = false) {
    applyStylesheet(this.config, this.customMedia);

    if (this.ambient) {
      if (this.config.enabled) {
        this.ambient.configure(this.config.atmosphereId, this.config.atmosphereIntensity);
      } else {
        this.ambient.configure('none', 0);
      }
    }

    this.domAdapter?.scanAndApply();
    this.petStage?.update();
    this.stickerLayer?.update();

    if (rerenderPanel && this.settingsPanel?.isOpen()) {
      this.settingsPanel.render();
    }
  }

  openSettings() {
    if (!this.settingsPanel) {
      this.pendingOpenSettings = true;
      return false;
    }
    this.domAdapter?.ensureSettingsEntry();
    const navBtn = document.querySelector('[data-agy-ct-nav="custom-theme"]');
    if (navBtn && navBtn.getBoundingClientRect().width > 0) {
      navBtn.click();
      return true;
    }

    // Fallback floating drawer if Settings view isn't currently open
    if (!this.fallbackModal) {
      const overlay = document.createElement('div');
      overlay.id = 'agy-ct-fallback-modal';
      overlay.setAttribute('data-agy-ct-injected', 'true');
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:9990;background:rgba(0,0,0,0.68);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;';
      const card = document.createElement('div');
      card.style.cssText =
        'width:min(820px,95vw);max-height:88vh;overflow:auto;background:#18181b;border:1px solid rgba(255,255,255,0.12);border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,0.75);';
      const top = document.createElement('div');
      top.style.cssText =
        'display:flex;justify-content:flex-end;padding:10px 14px 0;';
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'agy-ct-btn';
      closeBtn.textContent = '✕ Đóng';
      closeBtn.onclick = () => this.closeFallbackModal();
      top.appendChild(closeBtn);
      card.appendChild(top);
      overlay.appendChild(card);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeFallbackModal();
      });
      this.fallbackModal = { overlay, card };
    }

    const panel = this.settingsPanel?.getElement();
    if (panel) {
      this.fallbackModal.card.appendChild(panel);
      panel.classList.add('is-open');
      this.settingsPanel.render();
      document.body.appendChild(this.fallbackModal.overlay);
    }
    return true;
  }

  closeFallbackModal() {
    if (!this.fallbackModal) return;
    this.fallbackModal.overlay.remove();
    this.settingsPanel?.clearView();
    this.domAdapter?.ensureSettingsEntry();
  }

  destroy() {
    document.removeEventListener('keydown', this.onKeyDown);
    this.domAdapter?.stop();
    this.ambient?.destroy();
    this.petStage?.destroy();
    this.stickerLayer?.destroy();
    this.settingsPanel?.clearView();
    this.fallbackModal?.overlay?.remove();
    this.launcherBtn?.remove();
    this.launcherBtn = null;
    removeBackgroundLayers();
    this.initialized = false;
    delete window.__AGY_CUSTOM_THEME__;
  }
}

// Singleton bootstrap (idempotent if injected twice)
if (window.__AGY_CUSTOM_THEME__?.destroy) {
  window.__AGY_CUSTOM_THEME__.destroy();
}

const instance = new CustomThemeInjector();
window.__AGY_CUSTOM_THEME__ = {
  version: '1.0.0',
  init: () => instance.init(),
  destroy: () => instance.destroy(),
  openSettings: () => instance.openSettings(),
  applyBundle: (id) => instance.applyBundle(id),
  getConfig: () => instance.config,
  setConfig: (patch) => instance.updateConfig(patch, true)
};

instance.init();
