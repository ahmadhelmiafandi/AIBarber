<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('branches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->text('address');
            $table->string('phone', 20)->nullable();
            $table->text('google_maps_url')->nullable();
            $table->jsonb('opening_hours')->default('{}');
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
            $table->softDeletesTz();
        });
    }
    public function down(): void {
        Schema::dropIfExists('branches');
    }
};