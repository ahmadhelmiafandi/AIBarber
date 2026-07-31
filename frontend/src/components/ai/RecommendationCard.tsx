import React from 'react';
import { AiRecommendationItemData } from '@/types/api';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

interface RecommendationCardProps {
  item: AiRecommendationItemData;
  onPreview: (hairstyleId: string) => void;
  isPreviewing: boolean;
}

export function RecommendationCard({ item, onPreview, isPreviewing }: RecommendationCardProps) {
  const hairstyleName = typeof item.hairstyle === 'object' ? item.hairstyle.name : `Hairstyle #${item.hairstyle}`;
  const hairstylePrice = typeof item.hairstyle === 'object' && item.hairstyle.price ? item.hairstyle.price : 75000;
  const hairstyleId = typeof item.hairstyle === 'object' ? item.hairstyle.id : item.hairstyle;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all shadow-xl relative overflow-hidden">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
            #{item.rank}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{hairstyleName}</h3>
            <p className="text-xs text-amber-400 font-semibold mt-0.5">
              Rp {hairstylePrice.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-extrabold text-xs flex items-center gap-1">
          <Sparkles className="size-3.5" />
          <span>{item.score}% Match</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-5 leading-relaxed">
        {item.reason}
      </p>

      <div className="flex gap-2">
        <button
          disabled={isPreviewing}
          onClick={() => onPreview(hairstyleId)}
          className="flex-1 h-10 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <Eye className="size-4" />
          <span>Generasi AI Preview</span>
        </button>

        <Link
          href="/booking"
          className="flex-1 h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Pesan Slot ini</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
