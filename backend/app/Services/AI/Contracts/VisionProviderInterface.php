<?php

namespace App\Services\AI\Contracts;

class VisionAnalysisResult
{
    public function __construct(
        public string $faceShape,
        public string $hairline,
        public string $hairTexture,
        public string $hairDensity,
        public float $confidence = 0.95,
        public array $rawMetadata = []
    ) {}
}

interface VisionProviderInterface
{
    public function analyzeFaceAndHair(string $imagePath): VisionAnalysisResult;
    public function getProviderName(): string;
}
