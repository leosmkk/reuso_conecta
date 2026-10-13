<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presenca extends Model implements ApiSerializavel
{
    protected $fillable = ['inscricao_id', 'data_hora', 'metodo', 'registrado_por'];

    public function inscricao(): BelongsTo
    {
        return $this->belongsTo(Inscricao::class);
    }

    public function resumo(): string
    {
        return sprintf('%s às %s (confirmado por %s)', $this->metodo, $this->data_hora, $this->registrado_por);
    }

    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'inscricaoId' => (string) $this->inscricao_id,
            'dataHora' => $this->data_hora,
            'metodo' => $this->metodo,
            'registradoPor' => $this->registrado_por,
        ];
    }

    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'inscricaoId' => 'inscricao_id',
            'dataHora' => 'data_hora',
            'metodo' => 'metodo',
            'registradoPor' => 'registrado_por',
        ];

        $atributos = [];
        foreach ($mapa as $chaveJson => $coluna) {
            if (array_key_exists($chaveJson, $dados)) {
                $atributos[$coluna] = $dados[$chaveJson];
            }
        }

        return $atributos;
    }

    public static function ordenacaoPadrao(): string
    {
        return 'id';
    }
}
