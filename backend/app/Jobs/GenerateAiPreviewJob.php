<?php

namespace App\Jobs;

use App\Models\AiPreview;
use App\Services\AI\AiPreviewGenerationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateAiPreviewJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $previewId
    ) {}

    public function handle(AiPreviewGenerationService $service): void
    {
        $preview = AiPreview::find($this->previewId);
        if ($preview && $preview->status !== 'completed') {
            $service->generatePreview($preview);
        }
    }
}
