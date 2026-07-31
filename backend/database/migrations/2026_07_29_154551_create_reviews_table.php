<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->unique()->constrained('bookings')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('barber_id')->constrained('barbers')->onDelete('cascade');
            $table->integer('rating');
            $table->text('content')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestampsTz();
            
            $table->index(['barber_id', 'rating']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('reviews');
    }
};