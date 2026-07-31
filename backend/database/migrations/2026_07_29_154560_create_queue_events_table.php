<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('queue_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('queue_id')->constrained('queues')->onDelete('cascade');
            $table->string('status', 50);
            $table->text('notes')->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });
        
        Schema::create('daily_ai_costs', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('provider', 50);
            $table->decimal('total_cost_usd', 10, 5)->default(0);
            $table->integer('total_requests')->default(0);
            $table->timestampsTz();
            $table->unique(['date', 'provider']);
        });
        
        Schema::create('face_embeddings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->text('embedding_vector'); // Stored as JSON or array string depending on pgvector
            $table->string('model', 50);
            $table->timestampTz('created_at')->useCurrent();
        });
    }
    public function down(): void {
        Schema::dropIfExists('face_embeddings');
        Schema::dropIfExists('daily_ai_costs');
        Schema::dropIfExists('queue_events');
    }
};