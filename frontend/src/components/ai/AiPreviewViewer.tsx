import React from 'react';
import { usePreviewQuery } from '@/hooks/use-ai-consultation';
import { CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

interface AiPreviewViewerProps {
  previewId: string;
}

export function AiPreviewViewer({ previewId }: AiPreviewViewerProps) {
  const { data: preview, isLoading } = usePreviewQuery(previewId);

  if (isLoading || (preview && (preview.status === 'pending' || preview.status === 'processing'))) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 my-6 shadow-xl">
        <Loader2 className="size-8 animate-spin text-amber-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-white">Memproses Preview Hairstyle AI...</p>
        <p className="text-xs text-slate-500 mt-1">Mengaplikasikan gaya rambut dan memverifikasi presisi identitas wajah</p>
      </div>
    );
  }

  if (!preview || preview.status === 'failed') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-slate-400 my-6">
        <AlertTriangle className="size-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-white">Gagal Membuat Preview AI</p>
        <p className="text-xs text-slate-500 mt-1">{preview?.error_message || 'Terjadi masalah saat memproses preview.'}</p>
      </div>
    );
  }

  const scorePct = preview.similarity_score ? Math.round(preview.similarity_score * 100) : 95;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl my-6 text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Sparkles className="size-5 text-amber-400" />
          AI Photorealistic Preview Result
        </h3>
        {preview.identity_verified ? (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold text-xs flex items-center gap-1">
            <CheckCircle2 className="size-3.5" />
            Identity Verified ({scorePct}%)
          </span>
        ) : (
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-semibold text-xs flex items-center gap-1">
            Low Identity Score ({scorePct}%)
          </span>
        )}
      </div>

      {preview.generated_image_url && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
          <img src={preview.generated_image_url} alt="AI Generated Preview" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Metric: {preview.metric || 'face_recognition_v1'}</span>
        <span>Threshold Used: {preview.threshold_used ?? 0.95}</span>
      </div>
    </div>
  );
}
