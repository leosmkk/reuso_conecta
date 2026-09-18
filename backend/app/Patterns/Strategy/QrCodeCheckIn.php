<?php

namespace App\Patterns\Strategy;

use App\Models\Inscricao;
use App\Models\Presenca;

class QrCodeCheckIn implements CheckInMethod
{
    public function nome(): string
    {
        return 'QR Code';
    }

    public function confirmarPresenca(Inscricao $inscricao, array $payload): ResultadoCheckIn
    {
        $tokenLido = $payload['token'] ?? '';

        if (!$inscricao->tokenConfere($tokenLido)) {
            return ResultadoCheckIn::falha('QR Code inválido ou expirado.');
        }

        $presenca = new Presenca([
            'data_hora' => now()->format('H:i'),
            'metodo' => $this->nome(),
            'registrado_por' => 'totem de check-in',
        ]);

        return ResultadoCheckIn::sucesso('Presença confirmada via QR Code.', $presenca);
    }
}
