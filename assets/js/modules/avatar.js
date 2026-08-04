export const AVATAR_SIZE = 256;
export const AVATAR_QUALITY = 0.82;
export const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function cropSquareToCanvas(image, size = AVATAR_SIZE) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const side = Math.min(sourceWidth, sourceHeight);
  const sx = Math.floor((sourceWidth - side) / 2);
  const sy = Math.floor((sourceHeight - side) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  context.drawImage(image, sx, sy, side, side, 0, 0, size, size);
  return canvas;
}

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_TYPES.has(file.type)) {
      reject(new Error("Use a JPG, PNG, or WebP mugshot."));
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image refused to load."));
    };
    image.src = url;
  });
}

export async function fileToAvatarBlob(file) {
  const image = await loadImageFromFile(file);
  const canvas = cropSquareToCanvas(image);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Could not encode mugshot.")),
      "image/jpeg",
      AVATAR_QUALITY
    );
  });
}

export function avatarPreviewUrl(blob) {
  return URL.createObjectURL(blob);
}
