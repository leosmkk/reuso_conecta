<?php

namespace App\Patterns\Strategy;

use App\Models\Inscricao;

/**
 * STRATEGY — contrato dos 3 exemplos de produção.
 */
interface CheckInMethod
{
    public function confirmarPresenca(Inscricao $inscricao, array $payload): ResultadoCheckIn;

    public function nome(): string;
}
