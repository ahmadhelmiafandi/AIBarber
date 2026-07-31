<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('ai_audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('operation_type', 50);
            $table->string('model_used', 100);
            $table->string('engine_version', 50);
            $table->integer('duration_ms');
            $table->decimal('similarity_score', 4, 3)->nullable();
            $table->decimal('cost_usd', 8, 5)->default(0.00000);
            $table->string('status', 20);
            $table->jsonb('request_payload')->nullable();
            $table->jsonb('response_payload')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            
            $table->index(['user_id']);
            $table->index(['created_at', 'operation_type', 'status'], 'idx_ai_logs_created_op_status');
        });
    }
    public function down(): void {
        Schema::dropIfExists('ai_audit_logs');
    }
};