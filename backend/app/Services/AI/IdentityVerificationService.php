<?php

namespace App\Services\AI;

use App\Models\SystemSetting;
use App\Services\AI\Contracts\IdentityVerificationResult;
use App\Services\AI\Contracts\IdentityVerifierInterface;

class IdentityVerificationService
{
    public function __construct(
        private readonly IdentityVerifierInterface $verifier
    ) {}

    public function getThreshold(): float
    {
        return (float) (SystemSetting::where('key', 'ai_identity_threshold')->value('value') ?? 0.95);
    }

    public function verify(string $originalImagePath, string $generatedImagePath): IdentityVerificationResult
    {
        $threshold = $this->getThreshold();
        return $this->verifier->verify($originalImagePath, $generatedImagePath, $threshold);
    }
}
