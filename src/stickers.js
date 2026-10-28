// Ailo pins. Files live in public/stickers/. `ring` is the outline colour, used for the pin's arrow.
export const STICKERS = [
  { id: 'navy', label: 'Navy pin', ring: '#102F76' },
  { id: 'coral', label: 'Coral pin', ring: '#F95762' },
  { id: 'cream', label: 'Cream pin', ring: '#FEF2D9' },
  { id: 'magenta', label: 'Magenta pin', ring: '#E7256C' },
];

export const ringFor = (id) => STICKERS.find((s) => s.id === id)?.ring;

export const stickerUrl = (id) => `${import.meta.env.BASE_URL}stickers/${id}.png`;

// Businesses without a chosen pin get a stable one based on their id.
export function stickerFor(b) {
  if (STICKERS.some((s) => s.id === b.sticker)) return b.sticker;
  const n = [...String(b.id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return STICKERS[n % STICKERS.length].id;
}
