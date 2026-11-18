import { BUBBLE_PRESETS } from '../presets/bubbles.js';
import { renderMascotSvg } from '../assets/mascots.js';

const SETTINGS_SIBLING_LABELS = new Set([
  'general',
  'application',
  'appearance',
  'account',
  'agent',
  'permissions',
  'browser',
  'customizations',
  'editor',
  'terminal',
  'shortcuts',
  'notifications',
  'models',
  'chung',
  'ứng dụng',
  'giao diện',
  'phím tắt',
  'thông báo',
  'mô hình'
]);

const PROTECTED_TAGS = new Set([
  'IMG',
  'SVG',
  'PATH',
  'CANVAS',
  'VIDEO',
  'IFRAME',
  'PRE',
  'CODE',
  'SCRIPT',
  'STYLE',
  'BUTTON',
  'INPUT',
  'TEXTAREA',
  'SELECT'
]);

function parseColorAlpha(value) {
  if (!value || value === 'transparent') return 0;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'transparent' || normalized === 'none') return 0;

  // CSS Color 4 slash alpha syntax: rgb(r g b / a), oklch(l c h / a), color(srgb ... / 50%)
  const slashMatch = normalized.match(/\/\s*([\d.]+)(%?)\s*\)$/);
  if (slashMatch) {
    const raw = Number(slashMatch[1]);
    const alpha = slashMatch[2] === '%' ? raw / 100 : raw;
    return Number.isFinite(alpha) ? alpha : 0;
  }

  // Legacy comma-separated rgba()/hsla()
  const commaAlphaMatch = normalized.match(/^(?:rgba|hsla)\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)$/);
  if (commaAlphaMatch) {
    const alpha = Number(commaAlphaMatch[1]);
    return Number.isFinite(alpha) ? alpha : 0;
  }

  // Opaque rgb(), hsl(), oklch(), oklab(), lab(), lch(), color() without alpha
  return /^(?:rgb|hsl|oklch|oklab|lab|lch|color)\(/.test(normalized) ? 1 : 0;
}

function isOpaqueColor(value, minAlpha = 0.65) {
  return parseColorAlpha(value) >= minAlpha;
}

function hasDecorativeSurfaceFill(style, minAlpha = 0.55) {
  const hasGradient =
    Boolean(style.backgroundImage) &&
    style.backgroundImage !== 'none' &&
    !style.backgroundImage.includes('url(');
  return isOpaqueColor(style.backgroundColor, minAlpha) || hasGradient;
}

/**
 * Non-destructive DOM adapter.
 * Uses MutationObserver + resilient heuristics + user-overridable customSelectors
 * to hook into Settings navigation, chat bubbles, chat input box, and surface panels
 * without modifying original application code.
 */
export class DomAdapter {
  constructor({ getConfig, onCustomNavClick, onNativeNavClick, onConfigPatch }) {
    this.getConfig = getConfig;
    this.onCustomNavClick = onCustomNavClick;
    this.onNativeNavClick = onNativeNavClick;
    this.onConfigPatch = onConfigPatch;

    this.settingsPanelEl = null;
    this.injectedNavBtn = null;
    this.activeContentPane = null;
    this.isCustomSettingsOpen = false;
    this.observer = null;
    this.rafScheduled = false;
    this.pickerCleanup = null;
    this.boundNativeItems = new WeakSet();
  }

  setSettingsPanel(panelEl) {
    this.settingsPanelEl = panelEl;
  }

  start() {
    this.scanAndApply();
    const scheduleScan = () => {
      if (this.rafScheduled) return;
      this.rafScheduled = true;
      requestAnimationFrame(() => {
        this.rafScheduled = false;
        this.scanAndApply();
      });
    };
    this.onWindowResize = scheduleScan;
    window.addEventListener('resize', this.onWindowResize);
    this.observer = new MutationObserver(scheduleScan);
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  stop() {
    if (this.onWindowResize) {
      window.removeEventListener('resize', this.onWindowResize);
      this.onWindowResize = null;
    }
    this.observer?.disconnect();
    this.observer = null;
    this.cancelPicker();
    this.cleanupInjectedNodes();
  }

  cleanupInjectedNodes() {
    document.querySelectorAll('[data-agy-ct-custom-active]').forEach((el) => {
      el.removeAttribute('data-agy-ct-custom-active');
    });
    document.querySelectorAll('[data-agy-ct-injected="true"]').forEach((el) => el.remove());
    document.querySelectorAll('.agy-ct-bubble-styled').forEach((el) => {
      el.classList.remove('agy-ct-bubble-styled');
    });
    document.querySelectorAll('.agy-ct-ai-card-styled').forEach((el) => {
      el.classList.remove('agy-ct-ai-card-styled');
    });
    document.querySelectorAll('.agy-ct-input-styled').forEach((el) => {
      el.classList.remove('agy-ct-input-styled');
    });
    document.querySelectorAll('.agy-ct-hidden-native').forEach((el) => {
      el.classList.remove('agy-ct-hidden-native');
    });
    document
      .querySelectorAll(
        '.agy-ct-surface-shell, .agy-ct-surface-sidebar, .agy-ct-surface-sidebar-inner, .agy-ct-surface-canvas, .agy-ct-surface-topbar'
      )
      .forEach((el) => {
        el.classList.remove(
          'agy-ct-surface-shell',
          'agy-ct-surface-sidebar',
          'agy-ct-surface-sidebar-inner',
          'agy-ct-surface-canvas',
          'agy-ct-surface-topbar'
        );
      });
  }

  scanAndApply() {
    const cfg = this.getConfig();
    this.decorateSurfaces(cfg);
    this.ensureSettingsEntry();

    if (!cfg.enabled) {
      document.querySelectorAll('.agy-ct-bubble-styled').forEach((el) => el.classList.remove('agy-ct-bubble-styled'));
      document.querySelectorAll('.agy-ct-bubble-mascot').forEach((el) => el.remove());
      document.querySelectorAll('.agy-ct-ai-card-styled').forEach((el) => el.classList.remove('agy-ct-ai-card-styled'));
      document.querySelectorAll('.agy-ct-input-styled').forEach((el) => el.classList.remove('agy-ct-input-styled'));
      return;
    }

    this.decorateChatBubbles(cfg);
    this.decorateAiResponses(cfg);
    this.decorateChatInput(cfg);
  }

  safeQueryAll(selector) {
    if (!selector || typeof selector !== 'string') return [];
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch {
      return [];
    }
  }

  isInsideInjectorUi(el) {
    if (!el) return true;
    return Boolean(
      el.closest('#agy-ct-settings-panel') ||
        el.closest('#agy-ct-fallback-modal') ||
        el.closest('#agy-ct-launcher') ||
        el.closest('#agy-ct-bg-root') ||
        el.closest('#agy-ct-ambient-canvas') ||
        el.closest('#agy-ct-pet-stage') ||
        el.closest('#agy-ct-picker-banner') ||
        el.closest('.agy-ct-sticker-node')
    );
  }

  isProtectedSurfaceEl(el) {
    if (!el || PROTECTED_TAGS.has(el.tagName)) return true;
    const role = el.getAttribute?.('role');
    if (
      role === 'dialog' ||
      role === 'alertdialog' ||
      role === 'menu' ||
      role === 'listbox' ||
      role === 'tooltip' ||
      el.getAttribute?.('aria-modal') === 'true'
    ) {
      return true;
    }
    return Boolean(
      el.closest?.(
        '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [role="tooltip"], [aria-modal="true"], [data-radix-popper-content-wrapper]'
      )
    );
  }

  classifyRealAppSurface(el, style, vw, vh, composerBoxes = []) {
    if (this.isInsideInjectorUi(el) || this.isProtectedSurfaceEl(el)) return null;
    if (
      el.closest?.(
        '.agy-ct-bubble-styled, .agy-ct-ai-card-styled, [data-testid="agent-response"], [data-testid*="agent-response"]'
      )
    ) {
      return null;
    }
    if (composerBoxes.some((box) => el === box || box.contains(el))) return null;

    const rect = el.getBoundingClientRect();
    if (rect.width < 110 || rect.height < 12) return null;

    const isMajorCanvas = rect.width >= vw * 0.52 && rect.height >= vh * 0.5;
    const isLeftSidebar =
      rect.left <= 24 && rect.width >= 130 && rect.width <= vw * 0.42 && rect.height >= vh * 0.48;
    const isRightPanel =
      rect.right >= vw - 28 &&
      rect.width >= 130 &&
      rect.width <= vw * 0.42 &&
      (rect.height >= vh * 0.45 ||
        (rect.top <= 110 &&
          rect.height >= 140 &&
          Boolean(el.querySelector('a, button, [role="button"], nav'))));
    const isTopBar =
      rect.top <= 16 &&
      rect.height >= 24 &&
      rect.height <= 96 &&
      (rect.width >= vw * 0.3 || (rect.left <= 24 && rect.width >= 120));
    const isComposerDock = composerBoxes.some((box) => {
      if (el === box || !el.contains(box)) return false;
      const boxRect = box.getBoundingClientRect();
      return rect.height <= vh * 0.48 && rect.width > boxRect.width + 48;
    });
    const hasGradient =
      Boolean(style.backgroundImage) &&
      style.backgroundImage !== 'none' &&
      !style.backgroundImage.includes('url(');
    const alpha = parseColorAlpha(style.backgroundColor);
    const hasComposerInside = Boolean(el.querySelector('textarea, [contenteditable="true"]'));
    const hasProseBlock = Boolean(el.querySelector('pre, code, table, blockquote'));
    const isEmptyText = (el.textContent || '').trim() === '';
    const isBottomFadeOrBar =
      !isLeftSidebar &&
      !isRightPanel &&
      !hasProseBlock &&
      rect.bottom >= vh - 340 &&
      rect.height <= 260 &&
      rect.width >= vw * 0.32 &&
      (isComposerDock ||
        hasComposerInside ||
        (hasGradient && isEmptyText) ||
        (alpha >= 0.25 && isEmptyText) ||
        (rect.bottom >= vh - 12 && rect.height <= 64));

    const isEdgeOrLayoutChrome =
      isMajorCanvas || isLeftSidebar || isRightPanel || isTopBar || isComposerDock || isBottomFadeOrBar;

    const zIndex = Number(style.zIndex);
    if (
      !isEdgeOrLayoutChrome &&
      (style.position === 'fixed' || style.position === 'absolute') &&
      Number.isFinite(zIndex) &&
      zIndex >= 40 &&
      rect.width < vw * 0.85 &&
      rect.height < vh * 0.85
    ) {
      return null;
    }

    const minAlpha = isBottomFadeOrBar || isComposerDock ? 0.25 : 0.45;
    const hasFill = hasDecorativeSurfaceFill(style, minAlpha);

    if (!hasFill) {
      const parentWidth = el.parentElement?.getBoundingClientRect?.().width || 0;
      const isStructuralSidebarCol =
        isLeftSidebar &&
        rect.height >= vh * 0.68 &&
        rect.top <= 48 &&
        parentWidth >= vw * 0.72 &&
        !el.parentElement?.closest('.agy-ct-surface-sidebar');
      if (isStructuralSidebarCol) return 'sidebar';

      const isStructuralTopRow =
        rect.top <= 12 &&
        rect.height >= 26 &&
        rect.height <= 88 &&
        rect.width >= vw * 0.68 &&
        !el.parentElement?.closest('.agy-ct-surface-topbar');
      if (isStructuralTopRow) return 'topbar';

      return null;
    }

    if (isMajorCanvas) return 'canvas';
    if (isComposerDock || isBottomFadeOrBar) return 'canvas';
    if (isLeftSidebar || isRightPanel) return 'sidebar';
    if (isTopBar) return 'topbar';
    if (rect.left > 120 && rect.width >= vw * 0.26 && rect.height >= vh * 0.48) return 'canvas';
    if (rect.width >= vw * 0.42 && rect.height >= vh * 0.42) return 'canvas';
    return null;
  }

  decorateSurfaces(cfg) {
    const sel = cfg.customSelectors || {};
    const shell =
      (sel.appShell && this.safeQueryAll(sel.appShell)[0]) ||
      document.querySelector('[data-agy-surface="shell"]');
    const sidebar =
      (sel.sidebar && this.safeQueryAll(sel.sidebar)[0]) ||
      document.querySelector('[data-agy-surface="sidebar"]');
    const canvas =
      (sel.mainCanvas && this.safeQueryAll(sel.mainCanvas)[0]) ||
      document.querySelector('[data-agy-surface="canvas"]');
    const topbar = document.querySelector('[data-agy-surface="topbar"]');

    if (shell) shell.classList.add('agy-ct-surface-shell');
    if (sidebar) sidebar.classList.add('agy-ct-surface-sidebar');
    if (canvas) canvas.classList.add('agy-ct-surface-canvas');
    if (topbar) topbar.classList.add('agy-ct-surface-topbar');

    // Auto-classify real Antigravity Electron surfaces when preview markers are absent
    if (cfg.enabled && !shell && !canvas && document.body) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const composerBoxes = this.findChatInputContainers(cfg);
      const elements = document.body.querySelectorAll('*');
      for (const el of elements) {
        if (
          el.classList.contains('agy-ct-surface-canvas') ||
          el.classList.contains('agy-ct-surface-sidebar') ||
          el.classList.contains('agy-ct-surface-sidebar-inner') ||
          el.classList.contains('agy-ct-surface-topbar')
        ) {
          continue;
        }
        const style = getComputedStyle(el);
        const insideChrome = Boolean(
          el.parentElement?.closest('.agy-ct-surface-sidebar, .agy-ct-surface-topbar')
        );
        if (insideChrome) {
          if (
            !this.isInsideInjectorUi(el) &&
            !this.isProtectedSurfaceEl(el) &&
            !composerBoxes.some((box) => el === box || box.contains(el)) &&
            hasDecorativeSurfaceFill(style, 0.48)
          ) {
            el.classList.add('agy-ct-surface-sidebar-inner');
          }
          continue;
        }
        const surface = this.classifyRealAppSurface(el, style, vw, vh, composerBoxes);
        if (surface === 'canvas') {
          el.classList.add('agy-ct-surface-canvas');
        } else if (surface === 'sidebar') {
          el.classList.add('agy-ct-surface-sidebar');
        } else if (surface === 'topbar' && !el.parentElement?.closest('.agy-ct-surface-topbar')) {
          el.classList.add('agy-ct-surface-topbar');
        }
      }
    }
  }

  /**
   * Locates Settings navigation list by matching sibling labels (General, Appearance, Shortcuts, etc.).
   */
  findSettingsContext() {
    const cfg = this.getConfig();
    if (cfg.customSelectors?.settingsNavList) {
      const customNav = this.safeQueryAll(cfg.customSelectors.settingsNavList)[0];
      if (customNav) {
        const content =
          (cfg.customSelectors.settingsContent && this.safeQueryAll(cfg.customSelectors.settingsContent)[0]) ||
          this.guessSettingsContentPane(customNav);
        return { navList: customNav, contentPane: content };
      }
    }

    const candidates = Array.from(document.querySelectorAll('nav, aside, ul, div')).filter(
      (el) => !this.isInsideInjectorUi(el)
    );

    let bestNav = null;
    let bestScore = 0;

    for (const container of candidates) {
      const clickables = Array.from(
        container.querySelectorAll(
          ':scope > button, :scope > a, :scope > li, :scope > div[role="button"], :scope > div[role="tab"], :scope > div[role="menuitem"], :scope > div[tabindex]'
        )
      );
      if (clickables.length < 3 || clickables.length > 20) continue;

      let matches = 0;
      for (const item of clickables) {
        const text = (item.textContent || '').trim().toLowerCase();
        if (SETTINGS_SIBLING_LABELS.has(text)) matches++;
      }
      if (matches >= 3 && matches > bestScore) {
        bestScore = matches;
        bestNav = container;
      }
    }

    if (!bestNav) return null;
    const contentPane =
      (cfg.customSelectors?.settingsContent && this.safeQueryAll(cfg.customSelectors.settingsContent)[0]) ||
      this.guessSettingsContentPane(bestNav);

    return { navList: bestNav, contentPane };
  }

  guessSettingsContentPane(navList) {
    const explicit = document.querySelector('[data-agy-settings-content]');
    if (explicit) return explicit;
    let parent = navList.parentElement;
    for (let depth = 0; depth < 3 && parent; depth++) {
      const siblings = Array.from(parent.children).filter(
        (ch) => ch !== navList && !ch.contains(navList) && ch.tagName !== 'STYLE'
      );
      const panel = siblings.find((ch) => ch.getBoundingClientRect().width > 240);
      if (panel) return panel;
      parent = parent.parentElement;
    }
    return null;
  }

  ensureSettingsEntry() {
    const ctx = this.findSettingsContext();
    if (!ctx || !ctx.navList) return;

    const { navList, contentPane } = ctx;
    this.activeContentPane = contentPane;

    // Bind native nav clicks to exit Custom theme cleanly
    const navItems = Array.from(navList.children).filter(
      (el) => el.getAttribute('data-agy-ct-injected') !== 'true'
    );
    for (const item of navItems) {
      const label = (item.textContent || '').trim().toLowerCase();
      if (SETTINGS_SIBLING_LABELS.has(label) && !this.boundNativeItems.has(item)) {
        this.boundNativeItems.add(item);
        item.addEventListener('click', () => {
          this.setCustomSettingsOpen(false);
          this.onNativeNavClick?.();
        });
      }
    }

    // Insert Custom theme item right after Appearance if missing
    let customBtn = navList.querySelector('[data-agy-ct-nav="custom-theme"]');
    if (!customBtn) {
      const appearanceEl = navItems.find((el) => {
        const txt = (el.textContent || '').trim().toLowerCase();
        return txt === 'appearance' || txt === 'giao diện';
      });
      const templateEl = appearanceEl || navItems[0];

      customBtn = document.createElement(templateEl?.tagName === 'LI' ? 'li' : 'button');
      if (customBtn.tagName === 'BUTTON') customBtn.type = 'button';
      customBtn.setAttribute('data-agy-ct-injected', 'true');
      customBtn.setAttribute('data-agy-ct-nav', 'custom-theme');

      if (templateEl && templateEl.className) {
        customBtn.className = `${templateEl.className} agy-ct-nav-item`;
        customBtn.classList.remove('active', 'is-active', 'selected');
      } else {
        customBtn.className = 'agy-ct-nav-fallback agy-ct-nav-item';
      }

      customBtn.innerHTML = `<span class="agy-ct-nav-label">Custom theme</span>`;
      customBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setCustomSettingsOpen(true);
        this.onCustomNavClick?.();
      });

      if (appearanceEl && appearanceEl.nextSibling) {
        navList.insertBefore(customBtn, appearanceEl.nextSibling);
      } else {
        navList.appendChild(customBtn);
      }
      this.injectedNavBtn = customBtn;
    }

    // Attach Settings Panel into contentPane if needed
    if (contentPane && this.settingsPanelEl && this.settingsPanelEl.parentElement !== contentPane) {
      contentPane.appendChild(this.settingsPanelEl);
    }

    if (this.isCustomSettingsOpen) {
      this.syncSettingsPaneVisibility();
    }
  }

  setCustomSettingsOpen(open) {
    this.isCustomSettingsOpen = open;
    this.syncSettingsPaneVisibility();
  }

  syncSettingsPaneVisibility() {
    if (!this.activeContentPane || !this.settingsPanelEl) return;

    const nativeChildren = Array.from(this.activeContentPane.children).filter(
      (ch) => ch !== this.settingsPanelEl
    );

    if (this.isCustomSettingsOpen) {
      nativeChildren.forEach((ch) => ch.classList.add('agy-ct-hidden-native'));
      this.settingsPanelEl.classList.add('is-open');
      this.injectedNavBtn?.classList.add('is-active');
      this.injectedNavBtn?.parentElement?.setAttribute('data-agy-ct-custom-active', 'true');
    } else {
      nativeChildren.forEach((ch) => ch.classList.remove('agy-ct-hidden-native'));
      this.settingsPanelEl.classList.remove('is-open');
      this.injectedNavBtn?.classList.remove('is-active');
      this.injectedNavBtn?.parentElement?.removeAttribute('data-agy-ct-custom-active');
    }
  }

  findChatBubbles(cfg) {
    if (cfg.customSelectors?.chatBubble) {
      return this.safeQueryAll(cfg.customSelectors.chatBubble).filter((el) => !this.isInsideInjectorUi(el));
    }

    const candidates = new Set();
    const selectors = [
      '[data-agy-chat-bubble]',
      '[data-message-author="user"]',
      '[data-message-role="user"]',
      '[data-testid*="user-message"]',
      '.user-message-bubble'
    ];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        if (!this.isInsideInjectorUi(el)) candidates.add(el);
      });
    }
    const raw = Array.from(candidates);
    // Keep only outermost bubble container so nested elements never get double borders or stacked mascots
    return raw.filter((el) => !raw.some((other) => other !== el && other.contains(el)));
  }

  decorateChatBubbles(cfg) {
    if (cfg.bubbleId === 'none') {
      document.querySelectorAll('.agy-ct-bubble-styled').forEach((el) => {
        el.classList.remove('agy-ct-bubble-styled');
        el.querySelector(':scope > .agy-ct-bubble-mascot')?.remove();
      });
      return;
    }
    const bubblePreset = BUBBLE_PRESETS.find((b) => b.id === cfg.bubbleId) || BUBBLE_PRESETS[0];
    const bubbles = this.findChatBubbles(cfg);
    const bubbleSet = new Set(bubbles);

    document.querySelectorAll('.agy-ct-bubble-styled').forEach((el) => {
      if (!bubbleSet.has(el)) {
        el.classList.remove('agy-ct-bubble-styled');
        el.querySelector(':scope > .agy-ct-bubble-mascot')?.remove();
      }
    });

    for (const el of bubbles) {
      el.classList.add('agy-ct-bubble-styled');

      let mascotHost = el.querySelector(':scope > .agy-ct-bubble-mascot');
      if (cfg.bubbleMascotEnabled && bubblePreset.mascotId) {
        const targetKey = `${bubblePreset.id}:${bubblePreset.mascotId}`;
        if (!mascotHost) {
          mascotHost = document.createElement('div');
          mascotHost.setAttribute('data-agy-ct-injected', 'true');
          el.appendChild(mascotHost);
        }
        if (mascotHost.dataset.mascotKey !== targetKey) {
          mascotHost.dataset.mascotKey = targetKey;
          mascotHost.className = `agy-ct-bubble-mascot agy-ct-bubble-mascot--${bubblePreset.mascotAlign || 'right-top'}`;
          mascotHost.innerHTML = renderMascotSvg(bubblePreset.mascotId, 'bubble');
        }
      } else if (mascotHost) {
        mascotHost.remove();
      }
    }
  }

  findAiResponses(cfg) {
    if (cfg.customSelectors?.aiResponse) {
      return this.safeQueryAll(cfg.customSelectors.aiResponse).filter((el) => !this.isInsideInjectorUi(el));
    }

    const candidates = new Set();
    const selectors = [
      '[data-testid="agent-response"]',
      '[data-testid*="agent-response"]',
      '[data-testid*="assistant-message"]',
      '[data-message-author="assistant"]',
      '[data-message-role="assistant"]'
    ];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        if (!this.isInsideInjectorUi(el)) candidates.add(el);
      });
    }
    const raw = Array.from(candidates);
    return raw.filter((el) => !raw.some((other) => other !== el && other.contains(el)));
  }

  decorateAiResponses(cfg) {
    const aiEnabled = cfg.enabled && (cfg.aiCard?.enabled ?? true);
    const aiResponses = this.findAiResponses(cfg);
    const aiSet = new Set(aiResponses);

    if (!aiEnabled) {
      document.querySelectorAll('.agy-ct-ai-card-styled').forEach((el) => {
        el.classList.remove('agy-ct-ai-card-styled');
      });
      return;
    }

    document.querySelectorAll('.agy-ct-ai-card-styled').forEach((el) => {
      if (!aiSet.has(el)) {
        el.classList.remove('agy-ct-ai-card-styled');
      }
    });

    for (const el of aiResponses) {
      el.classList.add('agy-ct-ai-card-styled');
    }
  }

  findChatInputContainers(cfg) {
    if (cfg.customSelectors?.chatInput) {
      return this.safeQueryAll(cfg.customSelectors.chatInput).filter((el) => !this.isInsideInjectorUi(el));
    }

    const found = new Set();
    document.querySelectorAll('[data-agy-chat-input]').forEach((el) => {
      if (!this.isInsideInjectorUi(el)) found.add(el);
    });

    if (found.size === 0) {
      // Heuristic: find composer input wrapping textarea or contenteditable with "Ask anything"
      const inputs = document.querySelectorAll('textarea, [contenteditable="true"]');
      for (const input of inputs) {
        if (this.isInsideInjectorUi(input) || this.isProtectedSurfaceEl(input)) continue;
        const ph = (input.getAttribute('placeholder') || input.getAttribute('data-placeholder') || '').toLowerCase();
        const aria = (input.getAttribute('aria-label') || '').toLowerCase();
        const box =
          input.closest('div[class*="rounded-2xl"], div[class*="rounded-xl"], div[class*="rounded-lg"], div[class*="rounded"], form, [role="region"], div[class*="composer"], div[class*="input"]') ||
          input.parentElement?.parentElement ||
          input.parentElement;
        const boxText = (box?.textContent || '').toLowerCase();
        const looksLikeChatComposer =
          ph.includes('ask') ||
          ph.includes('message') ||
          ph.includes('chat') ||
          aria.includes('chat') ||
          aria.includes('prompt') ||
          boxText.includes('ask anything') ||
          boxText.includes('@ to mention');

        if (looksLikeChatComposer && box && !this.isInsideInjectorUi(box)) {
          const rect = box.getBoundingClientRect();
          if (rect.width >= 260 && rect.height > 28 && rect.height <= window.innerHeight * 0.48) {
            found.add(box);
          }
        }
      }
    }

    return Array.from(found);
  }

  decorateChatInput(cfg) {
    const inputs = this.findChatInputContainers(cfg);
    if (cfg.inputId === 'none') {
      document.querySelectorAll('.agy-ct-input-styled').forEach((el) => {
        el.classList.remove('agy-ct-input-styled');
      });
      return inputs[0] || null;
    }
    for (const box of inputs) {
      box.classList.add('agy-ct-input-styled');
    }
    return inputs[0] || null;
  }

  /**
   * Visual Element Picker so users can point & click any Antigravity element
   * if an update changes DOM structure.
   */
  startVisualPicker(targetKey, labelText) {
    this.cancelPicker();

    const banner = document.createElement('div');
    banner.id = 'agy-ct-picker-banner';
    banner.setAttribute('data-agy-ct-injected', 'true');
    banner.innerHTML = `
      <span>🎯 Click vào phần tử <strong>${labelText}</strong> trên giao diện (Esc để huỷ)</span>
      <button type="button" class="agy-ct-btn" id="agy-ct-picker-cancel">Huỷ</button>
    `;
    document.body.appendChild(banner);

    let lastHover = null;

    const onMove = (e) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (lastHover && lastHover !== target) {
        lastHover.classList.remove('agy-ct-picker-hover');
      }
      if (target && !this.isInsideInjectorUi(target)) {
        lastHover = target;
        target.classList.add('agy-ct-picker-hover');
      }
    };

    const onClick = (e) => {
      const target = e.target;
      if (target?.closest('#agy-ct-picker-banner')) return;
      e.preventDefault();
      e.stopPropagation();

      if (!this.isInsideInjectorUi(target)) {
        const selector = this.buildSelectorPath(target);
        this.onConfigPatch?.({
          customSelectors: { [targetKey]: selector }
        });
      }
      this.cancelPicker();
    };

    const onKey = (e) => {
      if (e.key === 'Escape') this.cancelPicker();
    };

    banner.querySelector('#agy-ct-picker-cancel')?.addEventListener('click', () => this.cancelPicker());
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);

    this.pickerCleanup = () => {
      lastHover?.classList.remove('agy-ct-picker-hover');
      banner.remove();
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }

  cancelPicker() {
    if (this.pickerCleanup) {
      this.pickerCleanup();
      this.pickerCleanup = null;
    }
  }

  buildSelectorPath(el) {
    if (!el || el === document.body) return 'body';
    if (el.id && !el.id.startsWith('agy-ct-')) {
      return `#${CSS.escape(el.id)}`;
    }
    const parts = [];
    let cur = el;
    for (let depth = 0; cur && cur !== document.body && depth < 4; depth++) {
      let part = cur.tagName.toLowerCase();
      const classes = Array.from(cur.classList).filter(
        (c) => !c.startsWith('agy-ct-') && !c.includes(':') && c.length < 40
      );
      if (classes.length > 0) {
        part += `.${classes.slice(0, 2).map((c) => CSS.escape(c)).join('.')}`;
      }
      parts.unshift(part);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }
}
