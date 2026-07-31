<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('hairstyles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('category', 50)->nullable();
            $table->jsonb('suitable_face_shapes')->default('[]');
            $table->jsonb('unsuitable_face_shapes')->default('[]');
            $table->string('maintenance_level', 50)->nullable();
            $table->string('difficulty', 50)->nullable();
            $table->text('description')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();
        });
        
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('CREATE INDEX idx_hairstyles_suitable_shapes_gin ON hairstyles USING GIN (suitable_face_shapes)');
        }
    }
    public function down(): void {
        Schema::dropIfExists('hairstyles');
    }
};