<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('customer_face_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->foreignUuid('favorite_hairstyle_id')->nullable()->constrained('hairstyles')->onDelete('set null');
            $table->string('face_shape', 50)->nullable();
            $table->string('hairline', 50)->nullable();
            $table->string('hair_density', 50)->nullable();
            $table->string('hair_texture', 50)->nullable();
            $table->text('preference_notes')->nullable();
            $table->timestampsTz();
        });
    }
    public function down(): void {
        Schema::dropIfExists('customer_face_profiles');
    }
};