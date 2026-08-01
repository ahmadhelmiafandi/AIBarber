"use client";

import { useState, type DragEvent } from "react";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";

interface FacePhotoUploaderProps {
  onFileSelect?: (file: File) => void;
  onUpload?: (file: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function FacePhotoUploader({
  onFileSelect,
  onUpload,
  isLoading = false,
  disabled = false,
}: FacePhotoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isBtnDisabled = disabled || isLoading;

  function handleFileChange(file: File) {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (onFileSelect) onFileSelect(file);
      if (onUpload) onUpload(file);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (isBtnDisabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }

  function handleClear() {
    setSelectedFile(null);
    setPreviewUrl(null);
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isBtnDisabled && document.getElementById("photo-input")?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-amber-500 bg-amber-500/10"
            : previewUrl
            ? "border-emerald-500/50 bg-emerald-950/20"
            : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
        } ${isBtnDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          id="photo-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        />

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Loader2 className="size-10 animate-spin text-amber-400 mx-auto" />
            <p className="text-sm font-semibold text-white">Mengunggah dan Menganalisis Foto...</p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview Selfie" className="size-36 object-cover rounded-2xl mx-auto border-2 border-amber-500/50 shadow-md" />
            <p className="text-xs text-emerald-400 font-medium">Foto Terpilih: {selectedFile?.name}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="size-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400">
              <Upload className="size-6" />
            </div>
            <p className="text-sm font-semibold text-white">Tarik & Lepas foto di sini, atau klik untuk memilih</p>
            <p className="text-xs text-slate-500">Format: JPG, PNG, WEBP (Maks 10MB)</p>
          </div>
        )}
      </div>

      {selectedFile && !isLoading && (
        <div className="mt-3 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <ImageIcon className="size-4 text-amber-400 shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-500 hover:text-red-400 transition-colors p-1"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
