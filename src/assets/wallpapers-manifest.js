/**
 * Built-in wallpaper manifest.
 * During `scripts/build.mjs`, `embeddedDataUri` is populated with base64 Data URIs
 * so `dist/antigravity-theme-injector.js` runs 100% standalone with zero external file deps.
 * During local ES module preview (`preview.html`), `previewPath` resolves to `./assets/wallpapers/...`.
 */
export const WALLPAPERS = [
  {
    id: 'sakura-shrine-8k',
    name: 'Hoa Anh Đào Đêm 8K',
    nameEn: 'Midnight Sakura 8K',
    badge: '8K Sắc Nét',
    badgeEn: '8K Ultra HD',
    recommendedAccent: '#f472b6',
    recommendedAtmosphere: 'sakura',
    recommendedBubble: 'hoa-anh-dao',
    previewPath: './assets/wallpapers/sakura-shrine-8k.jpg',
    embeddedDataUri: ''
  },
  {
    id: 'minato-hokage-8k',
    name: 'Đệ Tứ Hokage 8K',
    nameEn: 'Minato Hokage 8K',
    badge: '8K Sắc Nét',
    badgeEn: '8K Ultra HD',
    recommendedAccent: '#ef4444',
    recommendedAtmosphere: 'none',
    recommendedBubble: 'toi-gian',
    previewPath: './assets/wallpapers/minato-hokage-8k.jpg',
    embeddedDataUri: ''
  },
  {
    id: 'thunder-samurai',
    name: 'Lôi Kiếm Vũ Đêm',
    nameEn: 'Thunder Samurai (Rain)',
    badge: 'Ảnh bạn chọn',
    badgeEn: 'Featured',
    recommendedAccent: '#f5c451',
    recommendedAtmosphere: 'thunder-rain',
    recommendedBubble: 'loi-kiem',
    previewPath: './assets/wallpapers/thunder-samurai.jpg',
    embeddedDataUri: ''
  },
  {
    id: 'cosmic-violin-4k',
    name: 'Địa Cầu Violin 4K',
    nameEn: 'Cosmic Violin 4K',
    badge: '4K Sắc Nét',
    badgeEn: '4K Ultra HD',
    recommendedAccent: '#60a5fa',
    recommendedAtmosphere: 'stardust',
    recommendedBubble: 'thien-ha',
    previewPath: './assets/wallpapers/cosmic-violin-4k.jpg',
    embeddedDataUri: ''
  },
  {
    id: 'cosmic-earth-night',
    name: 'Địa Cầu Ánh Sao',
    nameEn: 'Cosmic Night Earth',
    badge: 'Vũ trụ',
    badgeEn: 'Cosmic',
    recommendedAccent: '#60a5fa',
    recommendedAtmosphere: 'stardust',
    recommendedBubble: 'thien-ha',
    previewPath: './assets/wallpapers/cosmic-earth-night.jpg',
    embeddedDataUri: ''
  },
  {
    id: 'sakura-shrine-night',
    name: 'Đền Thờ Anh Đào Đêm',
    nameEn: 'Midnight Sakura Shrine',
    badge: 'Cổ phong',
    badgeEn: 'Shrine',
    recommendedAccent: '#f472b6',
    recommendedAtmosphere: 'sakura',
    recommendedBubble: 'hoa-anh-dao',
    previewPath: './assets/wallpapers/sakura-shrine-night.jpg',
    embeddedDataUri: ''
  },
  {
    id: 'jade-dragon-mist',
    name: 'Thung Lũng Ngọc Bích',
    nameEn: 'Emerald Dragon Mist',
    badge: 'Tiên cảnh',
    badgeEn: 'Mystic',
    recommendedAccent: '#34d399',
    recommendedAtmosphere: 'fireflies',
    recommendedBubble: 'rong-ngoc',
    previewPath: './assets/wallpapers/jade-dragon-mist.jpg',
    embeddedDataUri: ''
  },
  {
    id: 'none',
    name: 'Không dùng ảnh nền',
    nameEn: 'No Wallpaper',
    badge: 'Mặc định',
    badgeEn: 'Clean',
    recommendedAccent: '#94a3b8',
    recommendedAtmosphere: 'none',
    recommendedBubble: 'toi-gian',
    previewPath: '',
    embeddedDataUri: ''
  }
];

export function resolveWallpaperUrl(wallpaper, customUrlMap = {}) {
  if (!wallpaper) return '';
  if (wallpaper.id === 'none') return '';
  if (wallpaper.id === 'custom') return customUrlMap.custom || customUrlMap.wallpaper || '';
  if (customUrlMap[wallpaper.id]) return customUrlMap[wallpaper.id];
  if (wallpaper.embeddedDataUri) return wallpaper.embeddedDataUri;
  return wallpaper.previewPath || '';
}
