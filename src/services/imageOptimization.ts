
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OptimizationResult {
  dataUrl: string;
  blob: Blob;
  size: number;
  width: number;
  height: number;
}

export const imageOptimization = {
  loadImage: (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error("Échec chargement image source"));
      img.src = url;
    });
  },

  processImage: async (
    image: HTMLImageElement,
    cropArea: CropArea,
    quality: number = 0.8,
    targetWidth: number = 800
  ): Promise<OptimizationResult> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false })!;

    // Validation et nettoyage des coordonnées (empêcher les valeurs négatives ou NaN)
    const sx = Math.max(0, cropArea.x || 0);
    const sy = Math.max(0, cropArea.y || 0);
    const sw = Math.min(image.width - sx, cropArea.width || image.width);
    const sh = Math.min(image.height - sy, cropArea.height || image.height);

    // Calcul de la taille de sortie en gardant le ratio du crop
    const outputWidth = targetWidth;
    const outputHeight = (sh / sw) * targetWidth;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Fond blanc
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessin
    ctx.drawImage(
      image,
      sx, sy, sw, sh,
      0, 0, outputWidth, outputHeight
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                dataUrl: reader.result as string,
                blob: blob,
                size: blob.size,
                width: canvas.width,
                height: canvas.height
              });
            };
            reader.onerror = () => reject(new Error("Erreur lecture Blob"));
            reader.readAsDataURL(blob);
          } else {
            reject(new Error("Échec génération du fichier (Canvas empty)"));
          }
        },
        'image/webp',
        quality
      );
    });
  },

  formatSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
