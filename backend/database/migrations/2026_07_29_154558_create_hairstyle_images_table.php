<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('hairstyle_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('hairstyle_id')->constrained('hairstyles')->onDelete('cascade');
            $table->string('type', 50)->default('front'); // front, side, back, 3d, reference
            $table->text('image_url');
            $table->boolean('is_primary')->default(false);
            $table->timestampsTz();
        });
    }
    public function down(): void {
        Schema::dropIfExists('hairstyle_images');
    }
};