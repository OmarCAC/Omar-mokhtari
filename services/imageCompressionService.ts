
import imageCompression from 'browser-image-compression';

export interface CompressedImageResult {
  file: File;
  dataUrl: string; // Base64 pour affichage/stockage
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  mimeType: string;
  fileName: string;
}

export const ImageCompressionService = {
  /**
   * Valide si le fichier est une image supportée
   */
  validateFileType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    return validTypes.includes(file.type);
  },

  /**
   * Formate la taille des fichiers en format lisible (KB, MB)
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Convertit un Blob/File en Base64
   */
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Processus principal de compression
   * @param file Le fichier original
   * @param maxSizeMB Taille max en MB (défaut 0.8 pour laisser de la marge au Base64)
   * @param maxWidthOrHeight Dimension max en px
   */
  async compress(file: File, maxSizeMB: number = 0.8, maxWidthOrHeight: number = 1280): Promise<CompressedImageResult> {
    // 1. Validation
    if (!this.validateFileType(file)) {
      throw new Error("Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.");
    }

    // Options de compression
    const options = {
      maxSizeMB: maxSizeMB,
      maxWidthOrHeight: maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: 0.8,
      fileType: 'image/jpeg' // Force conversion to JPEG for better compression
    };

    try {
      // 2. Compression
      const compressedFile = await imageCompression(file, options);

      // 3. Conversion en Base64 pour le stockage
      const dataUrl = await this.blobToBase64(compressedFile);

      // 4. Calcul des stats
      const originalSize = file.size;
      const compressedSize = compressedFile.size;
      const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

      // 5. Vérification finale de la taille (Hard limit 1MB)
      if (compressedSize > 1024 * 1024) {
        throw new Error(`L'image reste trop volumineuse (${this.formatSize(compressedSize)}) malgré la compression. Essayez une image plus petite.`);
      }

      return {
        file: compressedFile,
        dataUrl,
        originalSize,
        compressedSize,
        compressionRatio,
        mimeType: compressedFile.type,
        fileName: file.name
      };

    } catch (error) {
      console.error("Erreur de compression:", error);
      throw error;
    }
  }
};
