<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Cliente whitelabel da LPS (ex: Universidade Vale Verde). Liga/desliga
 * módulos via a tabela pivot tenant_modulo. Ver ConectaCampus\Domain\Tenant
 * em conectacampus/design-patterns para a versão didática desta classe.
 */
class Tenant extends Model
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
}
