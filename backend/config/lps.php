<?php

// Variabilidade da Linha de Produto de Software ConectaCampus, lida por
// App\Patterns\Singleton\VariabilityConfig. Mantida como config (em vez
// de env() direto na classe) para que `php artisan config:cache` funcione.
return [
    'checkin_method' => env('CHECKIN_METHOD', 'qrcode'),
    'certificado_template' => env('CERTIFICADO_TEMPLATE', 'universidade'),
    'tenant' => env('TENANT', 'universidade-vale-verde'),
];
