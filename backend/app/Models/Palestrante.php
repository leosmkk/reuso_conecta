<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Palestrante extends Model implements ApiSerializavel
{
    protected $fillable = ['nome', 'email', 'area_atuacao'];

    public function eventos(): HasMany
    {
        return $this->hasMany(Evento::class);
    }

    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'nome' => $this->nome,
            'email' => $this->email,
            'areaAtuacao' => $this->area_atuacao,
        ];
    }

    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'nome' => 'nome',
            'email' => 'email',
            'areaAtuacao' => 'area_atuacao',
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
        return 'nome';
    }
}
