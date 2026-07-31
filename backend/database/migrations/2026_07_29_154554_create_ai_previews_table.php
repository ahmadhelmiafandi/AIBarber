<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('ai_previews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('recommendation_id')->nullable()->constrained('ai_recommendations')->onDelete('set null');
            $table->foreignUuid('hairstyle_id')->constrained('hairstyles')->onDelete('cascade');
            $table->text('original_image_url');
            $table->text('generated_image_url')->nullable();
            $table->decimal('similarity_score', 4, 3)->nullable();
            $table->decimal('cost_usd', 8, 5)->default(0.00000);
            $table->string('status', 20)->default('processing');
            $table->timestampsTz();
        });
    }
    public function down(): void {
        Schema::dropIfExists('ai_previews');
    }
};