<?php

namespace App\Services\AI\Contracts;

class IdentityVerificationResult
{
    public function __construct(
        public float $similarityScore,
        public bool $identityVerified,
        public float $thresholdUsed,
        public string $metric = 'face_recognition_v1',
        public string $verifierVersion = 'v1.0'
    ) {}
}

interface IdentityVerifierInterface
{
    public function verify(string $originalImagePath, string $generatedImagePath, float $threshold = 0.95): IdentityVerificationResult;
    public function getProviderName(): string;
}
