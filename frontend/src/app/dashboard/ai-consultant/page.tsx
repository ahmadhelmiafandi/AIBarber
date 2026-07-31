'use client';

import React, { useState } from 'react';
import { FacePhotoUploader } from '@/components/ai/FacePhotoUploader';
import { RecommendationCard } from '@/components/ai/RecommendationCard';
import { AiConsultantChatModal } from '@/components/ai/AiConsultantChatModal';
import { AiPreviewViewer } from '@/components/ai/AiPreviewViewer';
import {
  useConsultationQuery,
  useGeneratePreviewMutation,
  useStartConsultationMutation,
} from '@/hooks/use-ai-consultation';
import { Sparkles, Bot, AlertCircle } from 'lucide-react';

export default function AiConsultantPage() {
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startMutation = useStartConsultationMutation();
  const generatePreviewMutation = useGeneratePreviewMutation();

  const { data: consultation } = useConsultationQuery(consultationId || undefined);

  const handleUploadPhoto = async (file: File) => {
    setErrorMsg(null);
    try {
      const res = await startMutation.mutateAsync(file);
      setConsultationId(res.consultation_id);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setErrorMsg(errorObj.response?.data?.message || 'Gagal memulai konsultasi AI.');
    }
  };

  const handleGeneratePreview = async (hairstyleId: string) => {
    if (!consultationId) return;
    setErrorMsg(null);
    try {
      const res = await generatePreviewMutation.mutateAsync({
        recommendation_id: consultationId,
        hairstyle_id: hairstyleId,
      });
      setActivePreviewId(res.preview_id);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setErrorMsg(errorObj.response?.data?.message || 'Gagal membuat preview AI.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="size-6 text-amber-500" />
            AI Smart Hair Consultant & Virtual Preview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analisis presisi bentuk wajah, klasifikasi rambut, dan rekomendasi model otomatis
          </p>
        </div>

        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer w-fit"
        >
          <Bot className="size-4" />
          <span>Tanya AI Consultant</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Section */}
      {!consultationId && (
        <FacePhotoUploader onUpload={handleUploadPhoto} isLoading={startMutation.isPending} />
      )}

      {/* Processing Status Banner */}
      {consultation && (consultation.status === 'pending' || consultation.status === 'processing') && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center text-slate-100 my-6 shadow-xl animate-pulse">
          <Sparkles className="size-8 text-amber-400 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">Sedang Menganalisis Wajah & Rambut...</h3>
          <p className="text-xs text-slate-400 mt-1">
            Ekstraksi fitur bentuk wajah dan kalkulasi bobot CMS rekomendasi
          </p>
        </div>
      )}

      {/* Results Section */}
      {consultation && consultation.status === 'completed' && (
        <div className="space-y-6">
          {/* Face Profile Summary */}
          {consultation.face_profile && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-white text-base mb-3">Hasil Deteksi & Analisis Fitur Wajah</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Bentuk Wajah</div>
                  <div className="text-sm font-bold text-amber-400 capitalize">{consultation.face_profile.face_shape}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Garis Rambut</div>
                  <div className="text-sm font-bold text-white capitalize">{consultation.face_profile.hairline || 'Normal'}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Tekstur Rambut</div>
                  <div className="text-sm font-bold text-white capitalize">{consultation.face_profile.hair_texture}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Kepadatan</div>
                  <div className="text-sm font-bold text-white capitalize">{consultation.face_profile.hair_density}</div>
                </div>
              </div>
            </div>
          )}

          {/* AI Preview Section if active */}
          {activePreviewId && <AiPreviewViewer previewId={activePreviewId} />}

          {/* Recommendations List */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Top Rekomendasi Model Rambut untuk Anda</h3>
            <div className="grid grid-cols-1 gap-4">
              {consultation.recommendations?.map((item) => (
                <RecommendationCard
                  key={item.rank}
                  item={item}
                  onPreview={handleGeneratePreview}
                  isPreviewing={generatePreviewMutation.isPending}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Modal */}
      <AiConsultantChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
