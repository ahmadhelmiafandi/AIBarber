<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('face_profile_id')->nullable()->constrained('customer_face_profiles')->onDelete('set null');
            $table->string('engine_version', 50);
            $table->string('rule_version', 50)->nullable();
            $table->timestampsTz();
        });
        
        Schema::create('ai_recommendation_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('recommendation_id')->constrained('ai_recommendations')->onDelete('cascade');
            $table->foreignUuid('hairstyle_id')->constrained('hairstyles')->onDelete('cascade');
            $table->integer('rank');
            $table->integer('score');
            $table->text('reason')->nullable();
            $table->timestampsTz();
        });
    }
    public function down(): void {
        Schema::dropIfExists('ai_recommendation_items');
        Schema::dropIfExists('ai_recommendations');
    }
};