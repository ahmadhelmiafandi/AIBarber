<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('daily_ai_costs', function (Blueprint $table) {
            $table->decimal('reserved_cost_usd', 10, 5)->default(0.00000)->after('total_cost_usd');
        });

        Schema::table('hairstyles', function (Blueprint $table) {
            $table->jsonb('suitable_hair_textures')->default('[]')->after('suitable_face_shapes');
            $table->boolean('is_active')->default(true)->after('description');
        });

        Schema::table('ai_recommendations', function (Blueprint $table) {
            $table->string('status', 20)->default('pending')->after('user_id');
            $table->string('idempotency_key', 100)->nullable()->index()->after('status');
            $table->text('image_url')->nullable()->after('rule_version');
            $table->text('error_message')->nullable()->after('image_url');
        });

        Schema::table('ai_previews', function (Blueprint $table) {
            $table->foreignUuid('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
            $table->string('idempotency_key', 100)->nullable()->index()->after('user_id');
            $table->decimal('threshold_used', 4, 3)->nullable()->after('similarity_score');
            $table->boolean('identity_verified')->default(false)->after('threshold_used');
            $table->string('metric', 50)->nullable()->after('identity_verified');
            $table->string('verifier_version', 20)->nullable()->after('metric');
            $table->text('error_message')->nullable()->after('status');
        });
    }

    public function down(): void {
        Schema::table('daily_ai_costs', function (Blueprint $table) {
            $table->dropColumn('reserved_cost_usd');
        });

        Schema::table('hairstyles', function (Blueprint $table) {
            $table->dropColumn(['suitable_hair_textures', 'is_active']);
        });

        Schema::table('ai_previews', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn([
                'user_id',
                'idempotency_key',
                'threshold_used',
                'identity_verified',
                'metric',
                'verifier_version',
                'error_message',
            ]);
        });

        Schema::table('ai_recommendations', function (Blueprint $table) {
            $table->dropColumn(['status', 'idempotency_key', 'image_url', 'error_message']);
        });
    }
};
