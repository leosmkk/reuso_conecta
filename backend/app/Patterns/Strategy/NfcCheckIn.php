<?php

namespace App\Patterns\Strategy;

use App\Models\Cracha;
use App\Models\Inscricao;
use App\Models\Presenca;
use Illuminate\Support\Collection;

class NfcCheckIn implements CheckInMethod
{
    /**
     * @param Collection<int, Cracha>|Cracha[] $crachas
     */
    public function __construct(private readonly iterable $crachas)
    {
    }

    public function nome(): string
    {
        return 'NFC';
    }

    public function confirmarPresenca(Inscricao $inscricao, array $payload): ResultadoCheckIn
    {
        $idLido = $payload['id_cracha'] ?? '';

        foreach ($this->crachas as $cracha) {
            if ($cracha->id_cracha === $idLido && $cracha->ativo && $cracha->pertenceA($inscricao->aluno)) {
                $presenca = new Presenca([
                    'data_hora' => now()->format('H:i'),
                    'metodo' => $this->nome(),
                    'registrado_por' => 'leitor NFC',
                ]);

                return ResultadoCheckIn::sucesso('Presença confirmada via crachá NFC.', $presenca);
            }
        }

        return ResultadoCheckIn::falha('Crachá NFC não reconhecido para este aluno.');
    }
}
