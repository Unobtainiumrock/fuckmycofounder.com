const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function normalizeAvatar(file: File): Promise<string> {
  if (!acceptedTypes.has(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP mugshot.");
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(sourceUrl);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not encode mugshot.");
    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      256,
      256,
    );
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) =>
          value
            ? resolve(value)
            : reject(new Error("Could not encode mugshot.")),
        "image/jpeg",
        0.82,
      );
    });
    return URL.createObjectURL(blob);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That image refused to load."));
    image.src = url;
  });
}
