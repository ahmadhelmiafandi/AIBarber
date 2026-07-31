<?php
namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    public function run(): void
    {
        SystemSetting::firstOrCreate(
            ['key' => 'feature_ai_preview'],
            ['value' => 'true', 'type' => 'boolean']
        );

        SystemSetting::firstOrCreate(
            ['key' => 'ai_identity_threshold'],
            ['value' => '0.95', 'type' => 'decimal']
        );
        
        SystemSetting::firstOrCreate(
            ['key' => 'booking_enabled'],
            ['value' => 'true', 'type' => 'boolean']
        );

        SystemSetting::firstOrCreate(
            ['key' => 'default_operating_hours'],
            ['value' => json_encode(['open' => '09:00', 'close' => '21:00']), 'type' => 'json']
        );

        SystemSetting::firstOrCreate(
            ['key' => 'branch_default_timezone'],
            ['value' => 'Asia/Jakarta', 'type' => 'string']
        );
    }
}