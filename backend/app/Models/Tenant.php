<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Cliente whitelabel da LPS (ex: Universidade Vale Verde). Liga/desliga
 * módulos via a tabela pivot tenant_modulo. Ver ConectaCampus\Domain\Tenant
 * em conectacampus/design-patterns para a versão didática desta classe.
 */
class Tenant extends Model implements ApiSerializavel
{
    protected $fillable = ['chave', 'nome', 'cor_primaria'];

    public function modulos(): BelongsToMany
    {
        return $this->belongsToMany(Modulo::class, 'tenant_modulo')
            ->withPivot('ativo')
            ->withTimestamps();
    }

    public function possuiModulo(string $chave): bool
    {
        $modulo = $this->modulos->firstWhere('chave', $chave);

        return $modulo !== null && (bool) $modulo->pivot->ativo;
    }

    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'chave' => $this->chave,
            'nome' => $this->nome,
            'corPrimaria' => $this->cor_primaria,
        ];
    }

    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'chave' => 'chave',
            'nome' => 'nome',
            'corPrimaria' => 'cor_primaria',
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
