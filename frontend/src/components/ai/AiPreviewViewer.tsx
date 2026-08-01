"use client";

import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AiPreviewData {
  id?: string;
  generated_image_url?: string;
  identity_verified?: boolean;
  identity_score?: number;
  metric?: string;
  threshold_used?: number;
}

interface AiPreviewViewerProps {
  preview?: AiPreviewData | null;
  previewId?: string;
}

export function AiPreviewViewer({ preview, previewId }: AiPreviewViewerProps) {
  const { data: fetchedPreview, isLoading } = useQuery({
    queryKey: ["ai-preview", previewId],
    queryFn: async () => {
      if (!previewId) return null;
      const res = await apiClient.get<{ data: AiPreviewData }>(`/ai/previews/${previewId}`);
      return res.data.data;
    },
    enabled: !!previewId && !preview,
  });

  const activePreview = preview || fetchedPreview;

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl my-6 text-center text-slate-100 space-y-3">
        <Loader2 className="size-8 animate-spin text-amber-400 mx-auto" />
        <p className="text-sm font-semibold">Memuat AI Preview...</p>
      </div>
    );
  }

  if (!activePreview) return null;

  const scorePct = Math.round((activePreview.identity_score ?? 0) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl my-6 text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Sparkles className="size-5 text-amber-400" />
          AI Photorealistic Preview Result
        </h3>
        {activePreview.identity_verified ? (
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

      {activePreview.generated_image_url && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activePreview.generated_image_url} alt="AI Generated Preview" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Metric: {activePreview.metric || 'face_recognition_v1'}</span>
        <span>Threshold Used: {activePreview.threshold_used ?? 0.95}</span>
      </div>
    </div>
  );
}
