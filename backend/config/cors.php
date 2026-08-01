<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:3000,https://mybarber.my.id,https://www.mybarber.my.id'))),

    'allowed_origins_patterns' => [
        '#^https://.*\.mybarber\.my\.id$#',
        '#^https://mybarber\.my\.id$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Idempotency-Key'],

    'max_age' => 86400,

    'supports_credentials' => true,

];
