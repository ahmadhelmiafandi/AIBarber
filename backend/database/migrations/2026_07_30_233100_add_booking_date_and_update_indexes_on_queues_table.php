<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('queues', function (Blueprint $table) {
            $table->date('booking_date')->nullable()->after('branch_id');
        });

        // Backfill existing queue data from bookings table if any exist
        DB::statement('UPDATE queues SET booking_date = (SELECT booking_date FROM bookings WHERE bookings.id = queues.booking_id) WHERE booking_date IS NULL');

        Schema::table('queues', function (Blueprint $table) {
            $table->date('booking_date')->nullable(false)->change();

            // Drop legacy single-branch unique index
            $table->dropUnique('unique_queue_code_per_branch');

            // Add daily scoped unique indexes
            $table->unique(['branch_id', 'booking_date', 'queue_number'], 'unique_queue_num_per_branch_date');
            $table->unique(['branch_id', 'booking_date', 'queue_code'], 'unique_queue_code_per_branch_date');
        });
    }

    public function down(): void
    {
        Schema::table('queues', function (Blueprint $table) {
            $table->dropUnique('unique_queue_code_per_branch_date');
            $table->dropUnique('unique_queue_num_per_branch_date');
            $table->unique(['branch_id', 'queue_code'], 'unique_queue_code_per_branch');
            $table->dropColumn('booking_date');
        });
    }
};
