<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('booking_code', 20)->unique();
            $table->foreignUuid('customer_id')->constrained('users')->onDelete('restrict');
            $table->foreignUuid('barber_id')->constrained('barbers')->onDelete('restrict');
            $table->foreignUuid('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignUuid('service_id')->constrained('services')->onDelete('restrict');
            $table->date('booking_date');
            $table->time('booking_time');
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])->default('pending');
            $table->text('cancellation_reason')->nullable();
            $table->timestampsTz();
            
            $table->index(['branch_id', 'booking_date', 'status'], 'idx_bookings_branch_date_status');
            $table->index(['customer_id', 'status'], 'idx_bookings_customer_status');
        });
    }
    public function down(): void {
        Schema::dropIfExists('bookings');
    }
};