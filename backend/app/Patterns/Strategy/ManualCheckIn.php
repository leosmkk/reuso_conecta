<?php

namespace App\Patterns\Strategy;

use App\Models\Inscricao;
use App\Models\Presenca;

class ManualCheckIn implements CheckInMethod
{
    public function nome(): string
    {
        return 'Manual';
    }

    public function confirmarPresenca(Inscricao $inscricao, array $payload): ResultadoCheckIn
    {
        $operador = trim($payload['confirmado_por'] ?? '');

        if ($operador === '') {
            return ResultadoCheckIn::falha('Check-in manual requer identificar quem confirmou a presença.');
        }

        $presenca = new Presenca([
            'data_hora' => now()->format('H:i'),
            'metodo' => $this->nome(),
            'registrado_por' => $operador,
        ]);

        return ResultadoCheckIn::sucesso(sprintf('Presença confirmada manualmente por %s.', $operador), $presenca);
    }
}
