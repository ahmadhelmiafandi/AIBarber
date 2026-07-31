<?php

namespace App\Jobs;

use App\Models\AiPreview;
use App\Models\AiRecommendation;
use App\Models\SystemSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class CleanupExpiredAiStorageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $retentionHours = (int) (SystemSetting::where('key', 'ai_temp_image_retention_hours')->value('value') ?? 24);
        $previewRetentionDays = (int) (SystemSetting::where('key', 'ai_preview_retention_days')->value('value') ?? 7);

        // 1. Purge Old Temporary Uploads
        $uploadThreshold = Carbon::now()->subHours($retentionHours);
        $oldRecommendations = AiRecommendation::where('created_at', '<', $uploadThreshold)->get();

        foreach ($oldRecommendations as $rec) {
            if ($rec->image_url && Storage::disk('public')->exists($rec->image_url)) {
                Storage::disk('public')->delete($rec->image_url);
            }
        }

        // 2. Purge Old Previews
        $previewThreshold = Carbon::now()->subDays($previewRetentionDays);
        $oldPreviews = AiPreview::where('created_at', '<', $previewThreshold)->get();

        foreach ($oldPreviews as $preview) {
            if ($preview->generated_image_url && Storage::disk('public')->exists($preview->generated_image_url)) {
                Storage::disk('public')->delete($preview->generated_image_url);
            }
        }
    }
}
