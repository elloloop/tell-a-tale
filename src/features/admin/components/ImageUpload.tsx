'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { storage } from '@/shared/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function getCurrentLanguage() {
  if (typeof window !== 'undefined') {
    const storedLang = window.localStorage.getItem('userLanguage');
    if (storedLang) return storedLang;
    const hostname = window.location.hostname;
    if (hostname.includes('bullikatha.web.app')) return 'te';
    if (hostname.includes('penloop.web.app')) return 'en';
  }
  return 'en';
}

interface ImageUploadProps {
  selectedDate: Date;
  onUploadComplete?: (url: string) => void;
}

export const ImageUpload = ({ selectedDate, onUploadComplete }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const language = getCurrentLanguage();
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      // Validate file type
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov'];
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        throw new Error('Invalid file type. Please upload JPG, PNG, GIF, MP4, WebM, or MOV files.');
      }

      // Create Firebase Storage reference
      const imagePath = `prompts/${language}/${dateStr}.${fileExtension}`;
      const storageRef = ref(storage, imagePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      setUploadProgress(100);
      onUploadComplete?.(downloadURL);

      console.log('Image uploaded successfully:', downloadURL);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p>Selected Date: {format(selectedDate, 'MMMM d, yyyy')}</p>
        <p>Language: {getCurrentLanguage()}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="image-upload" className="block text-sm font-medium">
          Upload Image/Video for {format(selectedDate, 'MMM d, yyyy')}
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*,video/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>Supported formats: JPG, PNG, GIF, MP4, WebM, MOV</p>
        <p>
          Images will be stored in Firebase Storage under: prompts/{getCurrentLanguage()}
          /YYYY-MM-DD.ext
        </p>
      </div>
    </div>
  );
};
