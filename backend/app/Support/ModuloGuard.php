<?php

namespace App\Support;

use App\Models\Tenant;
use App\Patterns\Singleton\VariabilityConfig;

/**
 * Segunda metade do gap "modulosAtivos chega no frontend mas não gateia
 * nada": resolve o Tenant ativo (via o Singleton VariabilityConfig) e
 * responde se ele contratou um módulo, para os controllers decidirem
 * comportamento — não só a UI. Ver Tenant::possuiModulo().
 */
class ModuloGuard
{
    private static ?Tenant $tenantCache = null;

    private static ?string $chaveCache = null;

    public static function tenantAtivo(): ?Tenant
    {
        $chave = VariabilityConfig::getInstance()->getTenant();

        if (self::$tenantCache === null || self::$chaveCache !== $chave) {
            self::$tenantCache = Tenant::with('modulos')->where('chave', $chave)->first();
            self::$chaveCache = $chave;
        }

        return self::$tenantCache;
    }

    public static function possui(string $moduloChave): bool
    {
        return self::tenantAtivo()?->possuiModulo($moduloChave) ?? false;
    }

    /**
     * Só para testes: força a releitura do tenant ativo na próxima chamada.
     */
    public static function resetar(): void
    {
        self::$tenantCache = null;
        self::$chaveCache = null;
    }
}
