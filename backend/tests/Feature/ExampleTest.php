<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example verifying health check endpoint.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/api/v1/health');

        $response->assertStatus(200);
    }
}
