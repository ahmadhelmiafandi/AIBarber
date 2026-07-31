<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('ai_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('face_shape', 50);
            $table->foreignUuid('hairstyle_id')->constrained('hairstyles')->onDelete('cascade');
            $table->integer('score_boost')->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('prompt_template')->nullable();
            $table->text('negative_prompt')->nullable();
            $table->timestampsTz();
        });
    }
    public function down(): void {
        Schema::dropIfExists('ai_rules');
    }
};