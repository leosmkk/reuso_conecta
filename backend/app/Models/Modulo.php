<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use Illuminate\Database\Eloquent\Model;

/**
 * Feature flag da LPS (geo, qrcode, advReports, dualSignature, customField).
 */
class Modulo extends Model implements ApiSerializavel
{
    protected $fillable = ['chave', 'nome', 'descricao'];

    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'chave' => $this->chave,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
        ];
    }

    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'chave' => 'chave',
            'nome' => 'nome',
            'descricao' => 'descricao',
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
        return 'chave';
    }
}
