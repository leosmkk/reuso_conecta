<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cracha extends Model implements ApiSerializavel
{
    protected $fillable = ['id_cracha', 'aluno_id', 'ativo'];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }

    public function pertenceA(Aluno $aluno): bool
    {
        return $this->aluno_id === $aluno->id;
    }

    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'idCracha' => $this->id_cracha,
            'alunoId' => (string) $this->aluno_id,
            'ativo' => $this->ativo,
            'alunoNome' => $this->aluno?->nome,
        ];
    }

    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'idCracha' => 'id_cracha',
            'alunoId' => 'aluno_id',
            'ativo' => 'ativo',
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
