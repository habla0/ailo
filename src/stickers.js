// Ailo pins. Files live in public/stickers/.
export const STICKERS = [
  { id: 'navy', label: 'Navy pin' },
  { id: 'coral', label: 'Coral pin' },
  { id: 'cream', label: 'Cream pin' },
  { id: 'magenta', label: 'Magenta pin' },
];

export const stickerUrl = (id) => `${import.meta.env.BASE_URL}stickers/${id}.png`;

// Businesses without a chosen pin get a stable one based on their id.
export function stickerFor(b) {
  if (STICKERS.some((s) => s.id === b.sticker)) return b.sticker;
  const n = [...String(b.id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return STICKERS[n % STICKERS.length].id;
}
