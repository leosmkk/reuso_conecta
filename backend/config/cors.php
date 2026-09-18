<?php

// O middleware Illuminate\Http\Middleware\HandleCors já vem registrado
// globalmente pelo Laravel 12 — só precisa deste config para agir.
// POST/PUT com Content-Type: application/json disparam preflight
// (OPTIONS), por isso 'paths' cobre toda a api e todos os métodos.
return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
