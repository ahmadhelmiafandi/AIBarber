import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FacePhotoUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function FacePhotoUploader({ onUpload, isLoading }: FacePhotoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center">
      <h2 className="text-xl font-bold text-white mb-2">Upload Foto Wajah Anda</h2>
      <p className="text-xs text-slate-400 mb-6">
        Foto tampak depan tanpa kacamata hitam untuk analisis bentuk wajah & rekomendasi presisi.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
        }}
        className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer ${
          dragActive ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
        }`}
        onClick={() => document.getElementById('photo-input')?.click()}
      >
        <input
          id="photo-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        />

        {previewUrl ? (
          <div className="space-y-3">
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

      {selectedFile && (
        <button
          disabled={isLoading}
          onClick={handleSubmit}
          className="w-full mt-6 h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              <span>Memproses Analisis AI...</span>
            </>
          ) : (
            <>
              <ImageIcon className="size-5" />
              <span>Mulai Konsultasi & Analisis AI</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
