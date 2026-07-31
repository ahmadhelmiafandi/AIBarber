<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('queues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->unique()->constrained('bookings')->onDelete('cascade');
            $table->foreignUuid('branch_id')->constrained('branches')->onDelete('cascade');
            $table->integer('queue_number');
            $table->string('queue_code', 10);
            $table->enum('status', ['waiting', 'checked_in', 'called', 'on_service', 'completed', 'skipped', 'cancelled'])->default('waiting');
            $table->timestampTz('estimated_start_time');
            $table->timestampTz('estimated_finish_time');
            $table->timestampTz('actual_start_time')->nullable();
            $table->timestampTz('actual_finish_time')->nullable();
            $table->timestampsTz();
            
            $table->unique(['branch_id', 'queue_code'], 'unique_queue_code_per_branch');
            $table->index(['status', 'estimated_start_time'], 'idx_queues_status_est_start');
        });
    }
    public function down(): void {
        Schema::dropIfExists('queues');
    }
};