import { BUBBLE_PRESETS } from '../presets/bubbles.js';
import { INPUT_PRESETS } from '../presets/inputs.js';
import { WALLPAPERS, resolveWallpaperUrl } from '../assets/wallpapers-manifest.js';

const STYLE_ID = 'agy-ct-styles';

function resolveActiveWallpaperUrl(config, customMedia = {}) {
  if (!config?.enabled) return '';
  if (config.wallpaperId === 'custom') {
    return customMedia.wallpaper || '';
  }
  const wp = WALLPAPERS.find((w) => w.id === config.wallpaperId);
  return resolveWallpaperUrl(wp, customMedia);
}

export function buildStylesheet(config, customMedia = {}) {
  const bubble = BUBBLE_PRESETS.find((b) => b.id === config.bubbleId) || BUBBLE_PRESETS[0];
  const inputPreset = INPUT_PRESETS.find((i) => i.id === config.inputId) || INPUT_PRESETS[0];
  const wallpaperUrl = resolveActiveWallpaperUrl(config, customMedia);

  const hasWallpaper = Boolean(config.enabled && wallpaperUrl);
  const dimAlpha = Math.max(0, Math.min(0.95, (config.dimming ?? 48) / 100));
  const glassAlpha = Math.max(0.18, Math.min(0.95, (config.glassOpacity ?? 64) / 100));
  const blurPx = Math.max(0, Math.min(24, Number(config.blur ?? 0)));
  const accent = config.accentColor || '#f5c451';

  const aiEnabled = Boolean(config.enabled && (config.aiCard?.enabled ?? true));
  const aiOpacity = Math.max(0.3, Math.min(0.98, Number(config.aiCard?.opacity ?? 82) / 100));
  const aiBlur = Math.max(0, Math.min(30, Number(config.aiCard?.blur ?? 16)));
  const aiBg = bubble.aiBg || `rgba(15, 18, 26, ${aiOpacity})`;
  const aiBorder = bubble.aiBorder || '1px solid rgba(255, 255, 255, 0.12)';
  const aiShadow = bubble.aiShadow || '0 8px 32px rgba(0, 0, 0, 0.5)';
  const aiTextColor = bubble.aiText || '#f4f4f5';

  const scrollCapCss = bubble.scrollCaps
    ? `
      .agy-ct-bubble-styled::before,
      .agy-ct-bubble-styled::after {
        content: '';
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 8px;
        border-radius: 4px;
        background: linear-gradient(180deg, #b88a44, #5c3a14 50%, #b88a44);
        border: 1px solid #2e1b08;
        box-shadow: 0 2px 6px rgba(0,0,0,0.45);
        pointer-events: none;
      }
      .agy-ct-bubble-styled::before { left: -5px; }
      .agy-ct-bubble-styled::after { right: -5px; }
    `
    : '';

  const cyberCornerCss = bubble.cyberCorners
    ? `
      .agy-ct-bubble-styled::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(56,189,248,0.45), transparent 35%, transparent 65%, rgba(16,185,129,0.45));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        padding: 1.5px;
        pointer-events: none;
      }
    `
    : '';

  return `
    :root {
      --agy-ct-accent: ${accent};
      --agy-ct-glass-alpha: ${glassAlpha};
      --agy-ct-dim-alpha: ${dimAlpha};
      --agy-ct-blur: ${blurPx}px;
    }

    /* ===== Background Wallpaper & Ambient Layers ===== */
    html.agy-ct-active,
    html:has(body.agy-ct-active),
    body.agy-ct-active {
      background: transparent !important;
      background-color: transparent !important;
    }

    body.agy-ct-active {
      position: relative;
      z-index: 0;
    }

    #agy-ct-bg-root {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
      display: ${hasWallpaper ? 'block' : 'none'};
    }

    #agy-ct-bg-image {
      position: absolute;
      inset: ${blurPx > 0 ? '-18px' : '0'};
      background-size: ${config.wallpaperFit === 'contain' ? 'contain' : 'cover'};
      background-position: center center;
      background-repeat: no-repeat;
      filter: ${blurPx > 0 ? 'blur(var(--agy-ct-blur))' : 'none'};
      transform: ${blurPx > 0 ? 'scale(1.03)' : 'none'};
      transition: filter 0.2s ease;
    }

    #agy-ct-bg-dim {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 55% 42%, rgba(8, 10, 14, calc(var(--agy-ct-dim-alpha) * 0.65)), rgba(6, 7, 10, calc(var(--agy-ct-dim-alpha) * 1.05)));
      transition: background 0.15s ease;
    }

    #agy-ct-ambient-canvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      pointer-events: none;
      display: ${config.enabled && config.atmosphereId !== 'none' ? 'block' : 'none'};
    }

    /* Allow wallpaper to shine subtly through native translucent panels when enabled */
    ${
      hasWallpaper
        ? `
      body.agy-ct-active .agy-ct-surface-shell {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }
      body.agy-ct-active .agy-ct-surface-sidebar {
        background: rgba(10, 14, 22, ${Math.min(0.46, glassAlpha * 0.42).toFixed(2)}) !important;
        background-color: rgba(10, 14, 22, ${Math.min(0.46, glassAlpha * 0.42).toFixed(2)}) !important;
        background-image: none !important;
        backdrop-filter: blur(2px) saturate(118%);
        -webkit-backdrop-filter: blur(2px) saturate(118%);
        border-color: rgba(255, 255, 255, 0.12) !important;
      }
      body.agy-ct-active .agy-ct-surface-sidebar-inner {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      body.agy-ct-active .agy-ct-surface-canvas {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      body.agy-ct-active .agy-ct-surface-topbar {
        background: rgba(10, 14, 22, ${Math.min(0.42, glassAlpha * 0.34).toFixed(2)}) !important;
        background-color: rgba(10, 14, 22, ${Math.min(0.42, glassAlpha * 0.34).toFixed(2)}) !important;
        background-image: none !important;
        backdrop-filter: blur(3px) saturate(115%);
        -webkit-backdrop-filter: blur(3px) saturate(115%);
        border-color: rgba(255, 255, 255, 0.08) !important;
      }
    `
        : ''
    }

    /* ===== Styled Chat Bubbles ===== */
    ${
      config.enabled && config.bubbleId !== 'none'
        ? `
      .agy-ct-bubble-styled {
        position: relative !important;
        background: ${bubble.bg} !important;
        border: ${bubble.border} !important;
        color: ${bubble.text} !important;
        box-shadow: ${bubble.shadow} !important;
        border-radius: ${bubble.radius} !important;
        overflow: visible !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .agy-ct-bubble-styled * {
        color: inherit;
      }
      .agy-ct-bubble-styled pre {
        background: rgba(10, 12, 16, 0.72) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 8px !important;
      }
      .agy-ct-bubble-styled pre,
      .agy-ct-bubble-styled code {
        color: #e4e4e7 !important;
      }
      ${scrollCapCss}
      ${cyberCornerCss}

      .agy-ct-bubble-mascot {
        position: absolute;
        pointer-events: none;
        z-index: 4;
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.55));
      }
      .agy-ct-bubble-mascot--right-top {
        top: -34px;
        right: 14px;
        width: 58px;
        height: 46px;
      }
      .agy-ct-bubble-mascot--top-center {
        top: -22px;
        left: 50%;
        transform: translateX(-50%);
        width: 84px;
        height: 36px;
      }
    `
        : ''
    }

    /* ===== Styled AI Response Card (Glassmorphism) ===== */
    ${
      aiEnabled
        ? `
      .agy-ct-ai-card-styled {
        position: relative !important;
        background: ${aiBg} !important;
        backdrop-filter: blur(${aiBlur}px) saturate(140%) !important;
        -webkit-backdrop-filter: blur(${aiBlur}px) saturate(140%) !important;
        border: ${aiBorder} !important;
        border-radius: 18px !important;
        padding: 16px 22px !important;
        margin: 10px 0 16px 0 !important;
        box-shadow: ${aiShadow} !important;
        box-sizing: border-box !important;
        transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
      }
      .agy-ct-ai-card-styled [data-markdown-root] {
        color: ${aiTextColor} !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7) !important;
        line-height: 1.65 !important;
      }
      .agy-ct-ai-card-styled h1,
      .agy-ct-ai-card-styled h2,
      .agy-ct-ai-card-styled h3,
      .agy-ct-ai-card-styled h4,
      .agy-ct-ai-card-styled h5,
      .agy-ct-ai-card-styled h6 {
        color: #ffffff !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85) !important;
      }
      .agy-ct-ai-card-styled strong,
      .agy-ct-ai-card-styled b {
        color: #ffffff !important;
        font-weight: 600 !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8) !important;
      }
      .agy-ct-ai-card-styled a {
        color: color-mix(in srgb, var(--agy-ct-accent) 75%, #60a5fa) !important;
        text-decoration-color: rgba(255, 255, 255, 0.3) !important;
      }
      .agy-ct-ai-card-styled code:not(pre code) {
        background: rgba(255, 255, 255, 0.1) !important;
        color: ${bubble.sparkle || '#fef08a'} !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        border-radius: 4px !important;
        padding: 1px 5px !important;
        font-size: 0.9em !important;
      }
      .agy-ct-ai-card-styled pre {
        background: rgba(10, 12, 18, 0.88) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 10px !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
      }
      .agy-ct-ai-card-styled [data-testid="turn-cards-container"],
      .agy-ct-ai-card-styled [data-testid*="tool-call"] {
        background: rgba(12, 14, 20, 0.68) !important;
        border: 1px solid rgba(255, 255, 255, 0.09) !important;
        border-radius: 10px !important;
        padding: 6px 12px !important;
        margin-top: 8px !important;
      }
    `
        : ''
    }

    /* ===== Styled Chat Input Box ===== */
    ${
      config.inputId !== 'none'
        ? `
      .agy-ct-input-styled {
        position: relative !important;
        background: ${inputPreset.bg} !important;
        border: ${inputPreset.border} !important;
        box-shadow: ${inputPreset.shadow} !important;
        border-radius: ${inputPreset.radius} !important;
        backdrop-filter: blur(${inputPreset.blur}) !important;
        -webkit-backdrop-filter: blur(${inputPreset.blur}) !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
      }
      .agy-ct-input-styled:focus-within {
        border-color: ${inputPreset.focusBorder} !important;
      }
    `
        : ''
    }

    /* ===== SVG Character Animations ===== */
    .agy-ct-svg-art {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }
    @keyframes agyCtBob {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-2.5px); }
    }
    @keyframes agyCtFloat {
      0%, 100% { transform: translateY(0px) rotate(-1deg); }
      50% { transform: translateY(-6px) rotate(1.5deg); }
    }
    @keyframes agyCtBlink {
      0%, 92%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    @keyframes agyCtWag {
      0%, 100% { transform: rotate(-4deg); }
      50% { transform: rotate(6deg); }
    }
    @keyframes agyCtTwinkle {
      0%, 100% { opacity: 0.45; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.12); }
    }
    @keyframes agyCtSpark {
      0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 2px #fde047); }
      45% { opacity: 1; filter: drop-shadow(0 0 6px #fef08a); }
      52% { opacity: 0.35; }
      60% { opacity: 1; }
    }
    @keyframes agyCtSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .agy-ct-anim-bob { animation: agyCtBob 3.2s ease-in-out infinite; }
    .agy-ct-anim-float { animation: agyCtFloat 4.2s ease-in-out infinite; }
    .agy-ct-anim-blink { animation: agyCtBlink 4.6s ease-in-out infinite; }
    .agy-ct-anim-wag { animation: agyCtWag 2.4s ease-in-out infinite; }
    .agy-ct-anim-twinkle { animation: agyCtTwinkle 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .agy-ct-anim-spark { animation: agyCtSpark 1.8s linear infinite; }
    .agy-ct-anim-spin { animation: agyCtSpin 16s linear infinite; }

    /* ===== Floating Pet Stage ===== */
    #agy-ct-pet-stage {
      position: fixed;
      z-index: 45;
      cursor: grab;
      user-select: none;
      touch-action: none;
      transition: filter 0.2s ease;
    }
    #agy-ct-pet-stage:active { cursor: grabbing; }
    #agy-ct-pet-stage:hover .agy-ct-pet-body { transform: scale(1.07); }
    .agy-ct-pet-body {
      width: 100%;
      height: 100%;
      transition: transform 0.2s ease;
    }
    .agy-ct-pet-speech {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      background: rgba(20, 20, 24, 0.94);
      color: #f8fafc;
      border: 1px solid var(--agy-ct-accent);
      border-radius: 10px;
      padding: 6px 10px;
      font-size: 12px;
      line-height: 1.35;
      white-space: nowrap;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.22s ease, transform 0.22s ease;
    }
    .agy-ct-pet-speech.is-visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .agy-ct-pet-burst {
      position: fixed;
      pointer-events: none;
      z-index: 960;
      font-size: 14px;
      animation: agyCtBurstUp 0.95s ease-out forwards;
    }
    @keyframes agyCtBurstUp {
      0% { opacity: 1; transform: translate(0, 0) scale(0.7); }
      100% { opacity: 0; transform: translate(var(--dx, 0px), var(--dy, -36px)) scale(1.2); }
    }

    /* ===== Decorative Stickers ===== */
    .agy-ct-sticker-node {
      position: fixed;
      z-index: 40;
      cursor: grab;
      user-select: none;
      touch-action: none;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    .agy-ct-sticker-node:hover {
      transform: scale(1.1) rotate(3deg);
    }
    .agy-ct-sticker-node.has-glow {
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.24));
    }

    /* ===== Settings Nav Injection & Panel UI ===== */
    .agy-ct-nav-fallback {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.72);
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .agy-ct-nav-fallback:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #fff;
    }
    .agy-ct-nav-item.is-active {
      background: rgba(255, 255, 255, 0.11) !important;
      color: #ffffff !important;
    }
    [data-agy-ct-custom-active="true"] > :not([data-agy-ct-injected="true"]) {
      background: transparent !important;
      color: rgba(255, 255, 255, 0.72) !important;
    }

    #agy-ct-settings-panel {
      display: none;
      flex-direction: column;
      gap: 24px;
      padding: 20px 26px 42px;
      color: #e4e4e7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
      box-sizing: border-box;
      width: 100%;
      max-width: 780px;
    }
    #agy-ct-settings-panel *, #agy-ct-settings-panel *::before, #agy-ct-settings-panel *::after {
      box-sizing: border-box;
    }
    #agy-ct-settings-panel.is-open {
      display: flex;
    }
    .agy-ct-hidden-native {
      display: none !important;
    }

    .agy-ct-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .agy-ct-title-wrap h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .agy-ct-title-wrap p {
      margin: 4px 0 0;
      font-size: 12.5px;
      color: #a1a1aa;
    }
    .agy-ct-actions-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .agy-ct-btn {
      background: rgba(255, 255, 255, 0.07);
      color: #e4e4e7;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 6px 11px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .agy-ct-btn:hover {
      background: rgba(255, 255, 255, 0.13);
      border-color: rgba(255, 255, 255, 0.24);
    }
    .agy-ct-btn-accent {
      background: color-mix(in srgb, var(--agy-ct-accent) 20%, transparent);
      border-color: color-mix(in srgb, var(--agy-ct-accent) 60%, transparent);
      color: #fff;
    }
    .agy-ct-btn-danger {
      background: rgba(185, 28, 28, 0.85);
      border-color: rgba(248, 113, 113, 0.55);
      color: #fff;
    }
    .agy-ct-btn-danger:hover {
      background: rgba(220, 38, 38, 0.95);
      border-color: rgba(252, 165, 165, 0.8);
    }

    /* Custom Bundles & Modal Dialogs */
    .agy-ct-bundle-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .agy-ct-bundle-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
    }
    .agy-ct-mini-btn {
      background: rgba(255, 255, 255, 0.06);
      color: #e4e4e7;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 7px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.14s ease;
    }
    .agy-ct-mini-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.28);
    }
    .agy-ct-mini-btn--danger {
      color: #fca5a5;
    }
    .agy-ct-mini-btn--danger:hover {
      background: rgba(185, 28, 28, 0.85);
      border-color: rgba(248, 113, 113, 0.65);
      color: #fff;
    }
    .agy-ct-empty-hint {
      font-size: 12px;
      color: #a1a1aa;
      background: rgba(255, 255, 255, 0.025);
      border: 1px dashed rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 10px 12px;
      line-height: 1.45;
    }
    #agy-ct-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 10030;
      background: rgba(5, 6, 10, 0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
    }
    .agy-ct-modal-card {
      width: min(480px, 94vw);
      max-height: 86vh;
      overflow: auto;
      background: #18181b;
      color: #f4f4f5;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      padding: 18px 20px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.78);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .agy-ct-modal-head h4 {
      margin: 0;
      font-size: 15.5px;
      font-weight: 600;
      color: #ffffff;
    }
    .agy-ct-modal-body {
      font-size: 13px;
      color: #d4d4d8;
      line-height: 1.5;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .agy-ct-modal-note {
      font-size: 12px;
      color: #a1a1aa;
    }
    .agy-ct-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      flex-wrap: wrap;
      padding-top: 6px;
    }
    .agy-ct-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    @media (max-width: 520px) {
      .agy-ct-form-grid { grid-template-columns: 1fr; }
    }
    .agy-ct-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: #d4d4d8;
    }
    .agy-ct-field--full {
      grid-column: 1 / -1;
    }
    .agy-ct-input {
      background: #101116;
      color: #f4f4f5;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 7px;
      padding: 6px 9px;
      font-size: 12.5px;
      width: 100%;
    }

    .agy-ct-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .agy-ct-section-head h3 {
      margin: 0;
      font-size: 14.5px;
      font-weight: 600;
      color: #f4f4f5;
    }
    .agy-ct-section-head p {
      margin: 3px 0 0;
      font-size: 12.5px;
      color: #9ca3af;
    }

    .agy-ct-bundle-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
      gap: 10px;
    }
    .agy-ct-bundle-card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid rgba(255, 255, 255, 0.09);
      cursor: pointer;
      text-align: left;
      color: #f4f4f5;
      transition: all 0.16s ease;
    }
    .agy-ct-bundle-card:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.22);
      transform: translateY(-1px);
    }
    .agy-ct-bundle-badge {
      align-self: flex-start;
      font-size: 10.5px;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.09);
      color: var(--agy-ct-accent);
      font-weight: 600;
    }
    .agy-ct-bundle-title {
      font-size: 13px;
      font-weight: 600;
    }
    .agy-ct-bundle-sub {
      font-size: 11.5px;
      color: #a1a1aa;
      line-height: 1.35;
    }

    /* Wallpaper grid */
    .agy-ct-wp-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }
    .agy-ct-wp-card {
      position: relative;
      border-radius: 11px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      padding: 0;
      text-align: left;
      transition: all 0.16s ease;
    }
    .agy-ct-wp-card:hover {
      border-color: rgba(255, 255, 255, 0.28);
    }
    .agy-ct-wp-card.is-selected {
      border-color: #ffffff;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25);
    }
    .agy-ct-wp-thumb {
      height: 82px;
      width: 100%;
      background-size: cover;
      background-position: center;
      background-color: #15161a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #71717a;
    }
    .agy-ct-wp-meta {
      padding: 7px 9px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      background: rgba(18, 18, 22, 0.92);
      color: #e4e4e7;
      font-size: 11.5px;
      font-weight: 500;
    }

    /* Sliders */
    .agy-ct-controls-box {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .agy-ct-slider-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      align-items: center;
      gap: 12px;
    }
    .agy-ct-slider-label strong {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #f4f4f5;
    }
    .agy-ct-slider-label span {
      display: block;
      font-size: 11.5px;
      color: #9ca3af;
      margin-top: 2px;
    }
    .agy-ct-range {
      width: 140px;
      accent-color: #ffffff;
      cursor: pointer;
    }
    .agy-ct-range-val {
      min-width: 40px;
      text-align: right;
      font-size: 12.5px;
      color: #d4d4d8;
      font-variant-numeric: tabular-nums;
    }

    /* 2-Column Bubble Cards matching Image 1 */
    .agy-ct-bubble-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    @media (max-width: 560px) {
      .agy-ct-bubble-grid { grid-template-columns: 1fr; }
    }
    .agy-ct-bubble-card {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 118px;
      padding: 26px 16px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.025);
      border: 1.5px solid rgba(255, 255, 255, 0.09);
      cursor: pointer;
      color: #e4e4e7;
      text-align: left;
      transition: all 0.16s ease;
    }
    .agy-ct-bubble-card:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .agy-ct-bubble-card.is-selected {
      border-color: #e4e4e7;
      background: rgba(255, 255, 255, 0.07);
    }
    .agy-ct-preview-bubble-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px 0 10px;
    }
    .agy-ct-preview-bubble {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 175px;
      padding: 11px 18px;
      font-size: 13.5px;
      font-weight: 500;
    }
    .agy-ct-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12.5px;
      color: #d4d4d8;
      margin-top: 4px;
    }
    .agy-ct-check {
      font-size: 13px;
      color: #ffffff;
      font-weight: 700;
    }

    /* Input Box Cards */
    .agy-ct-input-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    @media (max-width: 560px) {
      .agy-ct-input-grid { grid-template-columns: 1fr; }
    }
    .agy-ct-input-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.025);
      border: 1.5px solid rgba(255, 255, 255, 0.09);
      cursor: pointer;
      color: #e4e4e7;
      text-align: left;
      transition: all 0.16s ease;
    }
    .agy-ct-input-card:hover {
      border-color: rgba(255, 255, 255, 0.25);
    }
    .agy-ct-input-card.is-selected {
      border-color: #ffffff;
      background: rgba(255, 255, 255, 0.07);
    }
    .agy-ct-input-mock {
      padding: 10px 12px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.55);
    }

    /* Sticker & Pet Grids */
    .agy-ct-asset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: 10px;
    }
    .agy-ct-asset-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 10px 8px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      color: #e4e4e7;
      transition: all 0.16s ease;
    }
    .agy-ct-asset-card:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.24);
    }
    .agy-ct-asset-card.is-selected {
      border-color: var(--agy-ct-accent);
      background: color-mix(in srgb, var(--agy-ct-accent) 13%, rgba(255, 255, 255, 0.04));
    }
    .agy-ct-asset-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .agy-ct-asset-icon img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .agy-ct-asset-name {
      font-size: 11.5px;
      text-align: center;
      line-height: 1.25;
      color: #e4e4e7;
    }

    .agy-ct-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .agy-ct-chip {
      padding: 6px 11px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      color: #d4d4d8;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .agy-ct-chip.is-selected {
      border-color: var(--agy-ct-accent);
      background: color-mix(in srgb, var(--agy-ct-accent) 20%, transparent);
      color: #ffffff;
    }

    .agy-ct-swatch {
      width: 24px;
      height: 24px;
      border-radius: 999px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .agy-ct-swatch:hover { transform: scale(1.12); }
    .agy-ct-swatch.is-selected { border-color: #ffffff; box-shadow: 0 0 10px rgba(255, 255, 255, 0.4); }

    .agy-ct-select {
      background: #18181b;
      color: #f4f4f5;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 7px;
      padding: 5px 8px;
      font-size: 12px;
    }

    .agy-ct-switch {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 12.5px;
    }

    /* Visual DOM Picker highlight */
    .agy-ct-picker-hover {
      outline: 2px dashed #facc15 !important;
      outline-offset: 2px !important;
      cursor: crosshair !important;
    }
    .agy-ct-wp-card,
    .agy-ct-asset-card {
      position: relative;
    }
    .agy-ct-card-del {
      position: absolute;
      top: 5px;
      right: 5px;
      z-index: 3;
      width: 20px;
      height: 20px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      background: rgba(15, 16, 22, 0.85);
      color: #fca5a5;
      font-size: 11px;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.78;
      transition: opacity 0.15s ease, background 0.15s ease, transform 0.15s ease;
    }
    .agy-ct-card-del:hover {
      opacity: 1;
      background: rgba(185, 28, 28, 0.9);
      color: #fff;
      transform: scale(1.08);
    }
    #agy-ct-picker-banner {
      position: fixed;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      background: #18181b;
      color: #fef08a;
      border: 1.5px solid #facc15;
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 12.5px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);
    }

    /* Quick 1-click Floating Launcher Pill */
    #agy-ct-launcher {
      position: fixed;
      top: 46px;
      right: 16px;
      z-index: 9980;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(20, 22, 28, 0.78);
      color: #f4f4f5;
      border: 1px solid color-mix(in srgb, var(--agy-ct-accent) 45%, rgba(255, 255, 255, 0.16));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
      transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
    }
    #agy-ct-launcher:hover {
      transform: translateY(-1px);
      background: rgba(28, 30, 38, 0.9);
      border-color: var(--agy-ct-accent);
    }
  `;
}

export function applyStylesheet(config, customMedia = {}) {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = buildStylesheet(config, customMedia);

  const wallpaperUrl = resolveActiveWallpaperUrl(config, customMedia);
  const imgLayer = document.getElementById('agy-ct-bg-image');
  if (imgLayer && imgLayer._agyWpUrl !== wallpaperUrl) {
    imgLayer._agyWpUrl = wallpaperUrl;
    imgLayer.style.backgroundImage = wallpaperUrl ? `url("${wallpaperUrl.replace(/"/g, '\\"')}")` : 'none';
  }

  if (config.enabled) {
    document.documentElement.classList.add('agy-ct-active');
    document.body.classList.add('agy-ct-active');
  } else {
    document.documentElement.classList.remove('agy-ct-active');
    document.body.classList.remove('agy-ct-active');
  }
}

export function ensureBackgroundLayers() {
  let canvas = document.getElementById('agy-ct-ambient-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'agy-ct-ambient-canvas';
    document.body.prepend(canvas);
  }
  let root = document.getElementById('agy-ct-bg-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'agy-ct-bg-root';
    const imgLayer = document.createElement('div');
    imgLayer.id = 'agy-ct-bg-image';
    const dimLayer = document.createElement('div');
    dimLayer.id = 'agy-ct-bg-dim';
    root.appendChild(imgLayer);
    root.appendChild(dimLayer);
    // Keep bg-root directly before ambient-canvas so rain/stars paint on top of wallpaper at z-index: -1
    document.body.prepend(root);
  }
  return { root, canvas };
}

export function removeBackgroundLayers() {
  document.getElementById(STYLE_ID)?.remove();
  document.getElementById('agy-ct-bg-root')?.remove();
  document.getElementById('agy-ct-ambient-canvas')?.remove();
  document.getElementById('agy-ct-launcher')?.remove();
  document.getElementById('agy-ct-modal-overlay')?.remove();
  document.documentElement.classList.remove('agy-ct-active');
  document.body.classList.remove('agy-ct-active');
}
