<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\VisionAnalysisResult;
use App\Services\AI\Contracts\VisionProviderInterface;

class HairAnalysisService
{
    public function __construct(
        private readonly VisionProviderInterface $visionProvider
    ) {}

    public function analyze(string $imagePath): VisionAnalysisResult
    {
        return $this->visionProvider->analyzeFaceAndHair($imagePath);
    }
}
