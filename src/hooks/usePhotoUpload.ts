import { useState } from 'react';

export interface UsePhotoUploadReturn {
  photoData: string | null;
  setPhotoData: (data: string | null) => void;
  resetPhotoState: () => void;
}

export function usePhotoUpload(): UsePhotoUploadReturn {
  const [photoData, setPhotoData] = useState<string | null>(null);

  const resetPhotoState = () => {
    setPhotoData(null);
  };

  return {
    photoData,
    setPhotoData,
    resetPhotoState,
  };
}
