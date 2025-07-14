"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import React, { useRef, useState } from "react"

interface DatePopupProps {
  date: Date
  onClose: () => void
}
// add image upload functionality when user selects image to upload and then upload it to the server
// make user wait by showing uploading... message while the image is being uploaded
// and then show the date in green color indicating that the image for that day is uploaded
// show file with current date appended to the name if it already doesn't have the selected date in the name
// allow deleting the image file for dates already uploaded
// all older dates to current date images to be archived
export const DatePopup = ({ date, onClose }: DatePopupProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper to append date to filename if not present
  const getDatedFileName = (file: File) => {
    const dateStr = format(date, "yyyy-MM-dd")
    if (file.name.includes(dateStr)) return file.name
    const ext = file.name.split('.').pop()
    const base = file.name.replace(/\.[^/.]+$/, "")
    return `${base}_${dateStr}.${ext}`
  }

  const getFolder = () => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setUploadSuccess(false)
      setUploadedFileName(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const datedName = getDatedFileName(selectedFile);
      // 1. Get pre-signed upload URL
      const presignRes = await fetch('/api/s3-presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: datedName,
          fileType: selectedFile.type,
          folder: getFolder(),
          action: 'upload',
        }),
      });
      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { url, key } = await presignRes.json();
      // 2. Upload file to S3
      const uploadRes = await fetch(url, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      });
      if (!uploadRes.ok) throw new Error('Upload to S3 failed');
      setUploadedFileName(datedName);
      setUploadSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setUploading(true);
    setError(null);
    try {
      const datedName = uploadedFileName || (selectedFile && getDatedFileName(selectedFile));
      if (!datedName) throw new Error('No file to delete');
      // 1. Get pre-signed delete URL
      const presignRes = await fetch('/api/s3-presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: datedName,
          folder: getFolder(),
          action: 'delete',
        }),
      });
      if (!presignRes.ok) throw new Error('Failed to get delete URL');
      const { url } = await presignRes.json();
      // 2. Delete file from S3
      const deleteRes = await fetch(url, { method: 'DELETE' });
      if (!deleteRes.ok && deleteRes.status !== 204) throw new Error('Delete from S3 failed');
      setUploadedFileName(null);
      setSelectedFile(null);
      setUploadSuccess(false);
    } catch (e: any) {
      setError(e.message || 'Delete failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <h3 className={`text-xl font-semibold mb-4 ${uploadSuccess ? "text-green-600" : ""}`}>Selected Date: {format(date, "MMMM d, yyyy")}</h3>
        <p className="text-lg mb-6">
          Upload image: <input type="file" ref={fileInputRef} onChange={handleFileChange} disabled={uploading} />
        </p>
        {uploading && <p className="text-blue-600 mb-2">Uploading...</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {uploadedFileName && (
          <div className="flex items-center justify-between bg-gray-100 rounded px-2 py-1 mb-2">
            <span className="text-sm text-green-700">{uploadedFileName}</span>
            <Button onClick={handleDelete} variant="ghost" size="sm" disabled={uploading}>Delete</Button>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="ghost" disabled={uploading}>Close</Button>
          <Button onClick={handleUpload} variant="default" disabled={!selectedFile || uploading || uploadSuccess}>Upload</Button>
        </div>
      </div>
    </div>
  )
} 