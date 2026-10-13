<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use Illuminate\Database\Eloquent\Model;

class CentroAcademico extends Model implements ApiSerializavel
{
    // Eloquent pluralizaria "CentroAcademico" para "centro_academicos".
    protected $table = 'centros_academicos';

    protected $fillable = ['nome', 'curso', 'email', 'presidente', 'vice_presidente', 'integrantes'];

    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'nome' => $this->nome,
            'curso' => $this->curso,
            'email' => $this->email,
            'presidente' => $this->presidente,
            'vicePresidente' => $this->vice_presidente,
            'integrantes' => $this->integrantes,
        ];
    }

    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'nome' => 'nome',
            'curso' => 'curso',
            'email' => 'email',
            'presidente' => 'presidente',
            'vicePresidente' => 'vice_presidente',
            'integrantes' => 'integrantes',
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
