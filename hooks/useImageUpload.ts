
import { useState } from 'react';
import { CompressedImageResult, ImageCompressionService } from '../services/imageCompressionService';

interface UseImageUploadReturn {
  compressedImage: CompressedImageResult | null;
  isCompressing: boolean;
  error: string | null;
  quotaInfo: { used: string; percent: number } | null;
  handleImageChange: (file: File) => Promise<void>;
  resetImage: () => void;
  setExistingImage: (url: string) => void;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [compressedImage, setCompressedImage] = useState<CompressedImageResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStorageQuota = () => {
    let total = 0;
    for (const x in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
        total += (localStorage[x].length * 2);
      }
    }
    const totalSize = total / 1024 / 1024;
    const limit = 5; 
    return {
      used: totalSize.toFixed(2),
      percent: Math.min((totalSize / limit) * 100, 100)
    };
  };

  const handleImageChange = async (file: File) => {
    setError(null);
    setIsCompressing(true);

    try {
      const quota = getStorageQuota();
      if (quota.percent > 95) {
        throw new Error("Espace de stockage saturé. Veuillez supprimer d'anciens articles ou images.");
      }

      const result = await ImageCompressionService.compress(file);
      setCompressedImage(result);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la compression.");
      setCompressedImage(null);
    } finally {
      setIsCompressing(false);
    }
  };

  const resetImage = () => {
    setCompressedImage(null);
    setError(null);
  };

  const setExistingImage = (url: string) => {
    if (!url) return;
    setCompressedImage({
      file: new File([], "existing.jpg"),
      dataUrl: url,
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      mimeType: "image/jpeg",
      fileName: "Image existante"
    });
  };

  return {
    compressedImage,
    isCompressing,
    error,
    quotaInfo: getStorageQuota(),
    handleImageChange,
    resetImage,
    setExistingImage
  };
};
