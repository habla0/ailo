// Shrinks an uploaded photo to a JPEG data URL small enough to store on the business document
// (Firestore documents are capped at 1 MB; firestore.rules enforces the same MAX_CHARS).
const MAX_SIDE = 1200;
const MAX_CHARS = 450_000; // two photos per business must fit in one document

export async function photoToDataUrl(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('That file is not an image we can read.'));
      i.src = url;
    });
    let scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/jpeg', 0.8);
      if (data.length <= MAX_CHARS) return data;
      scale *= 0.75;
    }
    throw new Error('That photo is too large. Try a smaller one.');
  } finally {
    URL.revokeObjectURL(url);
  }
}
