<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aluno extends Model implements ApiSerializavel
{
    protected $fillable = ['nome', 'email', 'telefone', 'matricula', 'curso', 'semestre', 'nascimento'];

    protected $casts = [
        'semestre' => 'integer',
        'nascimento' => 'date:Y-m-d',
    ];

    public function inscricoes(): HasMany
    {
        return $this->hasMany(Inscricao::class);
    }

    public function crachas(): HasMany
    {
        return $this->hasMany(Cracha::class);
    }

    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'nome' => $this->nome,
            'email' => $this->email,
            'telefone' => $this->telefone,
            'matricula' => $this->matricula,
            'curso' => $this->curso,
            'semestre' => $this->semestre,
            'nascimento' => $this->nascimento?->format('Y-m-d'),
        ];
    }

    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'nome' => 'nome',
            'email' => 'email',
            'telefone' => 'telefone',
            'matricula' => 'matricula',
            'curso' => 'curso',
            'semestre' => 'semestre',
            'nascimento' => 'nascimento',
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
