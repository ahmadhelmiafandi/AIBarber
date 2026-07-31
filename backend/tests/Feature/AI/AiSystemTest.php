<?php

namespace Tests\Feature\AI;

use App\Jobs\GenerateAiPreviewJob;
use App\Jobs\ProcessAiConsultationJob;
use App\Models\AiAuditLog;
use App\Models\AiPreview;
use App\Models\AiRecommendation;
use App\Models\AiRecommendationItem;
use App\Models\CustomerFaceProfile;
use App\Models\Hairstyle;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\AI\Adapters\MockAiAdapter;
use App\Services\AI\AiAuditAndCostService;
use App\Services\AI\IdentityVerificationService;
use App\Services\AI\RecommendationScoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\TestCase;

class AiSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Hairstyle $hairstyle1;
    protected Hairstyle $hairstyle2;
    protected Hairstyle $inactiveHairstyle;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'customer']);

        $this->hairstyle1 = Hairstyle::create([
            'id' => (string) Str::uuid(),
            'name' => 'Classic Pompadour',
            'is_active' => true,
            'suitable_face_shapes' => ['oval', 'round'],
            'suitable_hair_textures' => ['wavy', 'straight'],
        ]);

        $this->hairstyle2 = Hairstyle::create([
            'id' => (string) Str::uuid(),
            'name' => 'Textured Crop',
            'is_active' => true,
            'suitable_face_shapes' => ['square', 'oval'],
            'suitable_hair_textures' => ['straight'],
        ]);

        $this->inactiveHairstyle = Hairstyle::create([
            'id' => (string) Str::uuid(),
            'name' => 'Discontinued Cut',
            'is_active' => false,
        ]);
    }

    public function test_ai_consultation_is_idempotent(): void
    {
        Queue::fake();

        $file = UploadedFile::fake()->image('selfie.jpg', 500, 500);

        $res1 = $this->actingAs($this->user)
            ->withHeader('Idempotency-Key', 'test-key-123')
            ->postJson('/api/v1/ai/consultations', ['image' => $file]);

        $res1->assertStatus(202);
        $consultationId = $res1->json('data.consultation_id');

        // Second identical request
        $res2 = $this->actingAs($this->user)
            ->withHeader('Idempotency-Key', 'test-key-123')
            ->postJson('/api/v1/ai/consultations', ['image' => $file]);

        $res2->assertStatus(202);
        $this->assertEquals($consultationId, $res2->json('data.consultation_id'));

        Queue::assertPushed(ProcessAiConsultationJob::class, 1);
    }

    public function test_ai_consultation_job_dispatches_after_commit(): void
    {
        Queue::fake();

        $file = UploadedFile::fake()->image('selfie.jpg', 500, 500);

        $this->actingAs($this->user)
            ->postJson('/api/v1/ai/consultations', ['image' => $file])
            ->assertStatus(202);

        Queue::assertPushed(ProcessAiConsultationJob::class);
    }

    public function test_rollback_does_not_dispatch_ai_job(): void
    {
        Queue::fake();

        try {
            DB::transaction(function () {
                $rec = AiRecommendation::create([
                    'id' => (string) Str::uuid(),
                    'user_id' => $this->user->id,
                    'status' => 'pending',
                    'engine_version' => 'v1.0',
                ]);

                DB::afterCommit(function () use ($rec) {
                    ProcessAiConsultationJob::dispatch($rec->id, 'path.jpg');
                });

                throw new \Exception('Rollback test');
            });
        } catch (\Exception) {
            // Expected exception
        }

        Queue::assertNotPushed(ProcessAiConsultationJob::class);
    }

    public function test_preview_hairstyle_must_belong_to_recommendation(): void
    {
        $rec = AiRecommendation::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'status' => 'completed',
            'engine_version' => 'v1.0',
        ]);

        AiRecommendationItem::create([
            'id' => (string) Str::uuid(),
            'recommendation_id' => $rec->id,
            'hairstyle_id' => $this->hairstyle1->id,
            'rank' => 1,
            'score' => 90,
        ]);

        // Try preview with hairstyle2 which does NOT belong to recommendation items
        $this->actingAs($this->user)
            ->postJson('/api/v1/ai/previews', [
                'recommendation_id' => $rec->id,
                'hairstyle_id' => $this->hairstyle2->id,
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Gaya rambut yang dipilih harus merupakan bagian dari hasil rekomendasi.');
    }

    public function test_preview_requires_owned_recommendation(): void
    {
        $otherUser = User::factory()->create(['role' => 'customer']);

        $rec = AiRecommendation::create([
            'id' => (string) Str::uuid(),
            'user_id' => $otherUser->id,
            'status' => 'completed',
            'engine_version' => 'v1.0',
        ]);

        $this->actingAs($this->user)
            ->postJson('/api/v1/ai/previews', [
                'recommendation_id' => $rec->id,
            ])
            ->assertStatus(403);
    }

    public function test_preview_requires_completed_recommendation(): void
    {
        $rec = AiRecommendation::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'status' => 'pending',
            'engine_version' => 'v1.0',
        ]);

        $this->actingAs($this->user)
            ->postJson('/api/v1/ai/previews', [
                'recommendation_id' => $rec->id,
            ])
            ->assertStatus(422);
    }

    public function test_inactive_hairstyle_cannot_be_previewed(): void
    {
        $rec = AiRecommendation::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'status' => 'completed',
            'engine_version' => 'v1.0',
        ]);

        AiRecommendationItem::create([
            'id' => (string) Str::uuid(),
            'recommendation_id' => $rec->id,
            'hairstyle_id' => $this->inactiveHairstyle->id,
            'rank' => 1,
            'score' => 80,
        ]);

        $this->actingAs($this->user)
            ->postJson('/api/v1/ai/previews', [
                'recommendation_id' => $rec->id,
                'hairstyle_id' => $this->inactiveHairstyle->id,
            ])
            ->assertStatus(422);
    }

    public function test_preview_duplicate_request_uses_cache_or_dedup(): void
    {
        $rec = AiRecommendation::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'status' => 'completed',
            'engine_version' => 'v1.0',
        ]);

        AiRecommendationItem::create([
            'id' => (string) Str::uuid(),
            'recommendation_id' => $rec->id,
            'hairstyle_id' => $this->hairstyle1->id,
            'rank' => 1,
            'score' => 90,
        ]);

        $idempotencyKey = hash('sha256', $this->user->id . '_' . $rec->id . '_' . $this->hairstyle1->id . '_v1.0');

        AiPreview::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'recommendation_id' => $rec->id,
            'hairstyle_id' => $this->hairstyle1->id,
            'original_image_url' => 'orig.jpg',
            'generated_image_url' => 'http://example.com/cached.jpg',
            'idempotency_key' => $idempotencyKey,
            'status' => 'completed',
            'similarity_score' => 0.960,
        ]);

        $res = $this->actingAs($this->user)
            ->postJson('/api/v1/ai/previews', [
                'recommendation_id' => $rec->id,
                'hairstyle_id' => $this->hairstyle1->id,
            ]);

        $res->assertStatus(200)
            ->assertJsonPath('data.generated_image_url', 'http://example.com/cached.jpg');
    }

    public function test_identity_threshold_comes_from_system_settings(): void
    {
        SystemSetting::updateOrCreate(
            ['key' => 'ai_identity_threshold'],
            ['value' => '0.98', 'type' => 'string']
        );

        $service = app(IdentityVerificationService::class);
        $this->assertEquals(0.98, $service->getThreshold());
    }

    public function test_dynamic_scoring_weights_come_from_cms(): void
    {
        SystemSetting::updateOrCreate(
            ['key' => 'ai_weight_face_shape'],
            ['value' => '0.50', 'type' => 'string']
        );

        $scoringService = app(RecommendationScoringService::class);
        $weights = $scoringService->getScoringWeights();

        $this->assertEquals(0.50, $weights['face_shape']);
    }

    public function test_recommendation_ranking_is_deterministic_without_llm(): void
    {
        $profile = CustomerFaceProfile::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'face_shape' => 'oval',
            'hairline' => 'straight',
            'hair_texture' => 'wavy',
            'hair_density' => 'thick',
        ]);

        $scoringService = app(RecommendationScoringService::class);
        $ranked1 = $scoringService->scoreAndRank($profile);
        $ranked2 = $scoringService->scoreAndRank($profile);

        $this->assertEquals($ranked1->pluck('hairstyle.id'), $ranked2->pluck('hairstyle.id'));
    }

    public function test_concurrent_ai_requests_cannot_exceed_daily_budget(): void
    {
        SystemSetting::updateOrCreate(
            ['key' => 'daily_ai_cost_limit_usd'],
            ['value' => '0.01', 'type' => 'string']
        );

        $auditService = app(AiAuditAndCostService::class);

        // First reservation consumes budget
        $auditService->reserveBudget(0.01000);

        // Second reservation breaches limit
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $auditService->reserveBudget(0.00500);
    }

    public function test_ai_audit_does_not_store_raw_image_data(): void
    {
        $auditService = app(AiAuditAndCostService::class);

        $log = $auditService->logOperation([
            'user_id' => $this->user->id,
            'operation_type' => 'consultation',
            'request_payload' => ['image_base64' => 'raw_base64_data_here', 'recommendation_id' => 'rec-123'],
            'response_payload' => ['image_base64' => 'raw_response_data_here', 'count' => 3],
        ]);

        $this->assertArrayNotHasKey('image_base64', $log->request_payload);
        $this->assertArrayNotHasKey('image_base64', $log->response_payload);
        $this->assertEquals('rec-123', $log->request_payload['recommendation_id']);
    }

    public function test_mock_provider_not_used_in_production(): void
    {
        App::detectEnvironment(fn() => 'production');

        $this->expectException(\RuntimeException::class);
        new MockAiAdapter();
    }
}
