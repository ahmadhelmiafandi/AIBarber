<?php

namespace App\Services\AI\Contracts;

use App\Models\Hairstyle;

class ImageGenerationResult
{
    public function __construct(
        public string $generatedImageUrl,
        public float $costUsd = 0.0,
        public string $providerName = 'replicate',
        public array $rawMetadata = []
    ) {}
}

interface ImageGeneratorInterface
{
    public function generateHairstylePreview(string $sourceImagePath, Hairstyle $hairstyle): ImageGenerationResult;
    public function getProviderName(): string;
}
