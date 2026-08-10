<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Booking;
use App\Models\Queue;
use App\Models\QueueEvent;
use App\Models\Review;
use App\Models\CustomerFaceProfile;
use App\Models\FaceEmbedding;
use App\Models\AiRecommendation;
use App\Models\AiRecommendationItem;
use App\Models\AiPreview;
use App\Models\AiAuditLog;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use Illuminate\Support\Facades\DB;
use Database\Seeders\UserSeeder;

class ResetCustomerDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'customer:reset {--keep-demo : Re-create default demo customer after resetting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset dan hapus seluruh data customer, booking, review, dan profil AI terkait';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai pembersihan data customer...');

        DB::transaction(function () {
            // Find all customer users (including soft deleted)
            $customers = User::withTrashed()->where('role', 'customer')->get();
            $customerIds = $customers->pluck('id')->toArray();

            if (empty($customerIds)) {
                $this->info('Tidak ada data customer yang ditemukan.');
            } else {
                $count = count($customerIds);
                $this->line("Ditemukan {$count} data customer.");

                // 1. Delete Sanctum API tokens
                DB::table('personal_access_tokens')
                    ->where('tokenable_type', User::class)
                    ->whereIn('tokenable_id', $customerIds)
                    ->delete();

                // 2. Delete Reviews by customer
                Review::whereIn('user_id', $customerIds)->delete();

                // 3. Delete Bookings and related Queues/Events
                $bookings = Booking::whereIn('customer_id', $customerIds)->get();
                $bookingIds = $bookings->pluck('id')->toArray();

                if (!empty($bookingIds)) {
                    $queues = Queue::whereIn('booking_id', $bookingIds)->get();
                    $queueIds = $queues->pluck('id')->toArray();

                    if (!empty($queueIds)) {
                        QueueEvent::whereIn('queue_id', $queueIds)->delete();
                        Queue::whereIn('id', $queueIds)->delete();
                    }

                    Booking::whereIn('id', $bookingIds)->delete();
                }

                // 4. Delete AI & Face Data
                CustomerFaceProfile::whereIn('user_id', $customerIds)->delete();
                FaceEmbedding::whereIn('user_id', $customerIds)->delete();

                $recIds = AiRecommendation::whereIn('user_id', $customerIds)->pluck('id')->toArray();
                if (!empty($recIds)) {
                    AiRecommendationItem::whereIn('ai_recommendation_id', $recIds)->delete();
                    AiRecommendation::whereIn('id', $recIds)->delete();
                }

                AiPreview::whereIn('user_id', $customerIds)->delete();
                AiAuditLog::whereIn('user_id', $customerIds)->delete();

                // 5. Delete Notifications
                $notifIds = Notification::whereIn('user_id', $customerIds)->pluck('id')->toArray();
                if (!empty($notifIds)) {
                    NotificationDelivery::whereIn('notification_id', $notifIds)->delete();
                    Notification::whereIn('id', $notifIds)->delete();
                }

                // 6. Force delete Customer Users
                foreach ($customers as $customer) {
                    $customer->forceDelete();
                }

                $this->info("Berhasil menghapus {$count} data customer beserta relasinya.");
            }

            // If --keep-demo option is provided, re-create the demo customer
            if ($this->option('keep-demo')) {
                $this->line('Menyiapkan ulang akun Pelanggan Demo...');
                $seeder = new UserSeeder();
                $seeder->run();
                $this->info('Akun Pelanggan Demo berhasil dibuat ulang.');
            }
        });

        $this->info('Pembersihan data customer selesai!');
        return self::SUCCESS;
    }
}
