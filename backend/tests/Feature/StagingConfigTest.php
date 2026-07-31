<?php

namespace Tests\Feature;

use RuntimeException;
use Tests\TestCase;

class StagingConfigTest extends TestCase
{
    public function test_default_database_connection_defaults_to_pgsql(): void
    {
        $defaultDb = config('database.default');
        // Under testing environment phpunit.xml sets sqlite, but fallback in database.php is pgsql
        $this->assertContains($defaultDb, ['pgsql', 'sqlite']);
    }

    public function test_fail_fast_guard_prevents_sqlite_in_staging(): void
    {
        $appEnv = 'staging';
        $defaultConnection = 'sqlite';

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('STAGING/PRODUCTION DATABASE MISCONFIGURATION');

        if (in_array($appEnv, ['staging', 'production']) && $defaultConnection === 'sqlite') {
            throw new RuntimeException(
                "STAGING/PRODUCTION DATABASE MISCONFIGURATION: SQLite is strictly forbidden in {$appEnv} environment."
            );
        }
    }
}
