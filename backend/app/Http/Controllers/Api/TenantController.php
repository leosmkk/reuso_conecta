<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Patterns\Singleton\VariabilityConfig;
use Illuminate\Http\JsonResponse;

/**
 * GET /api/tenant-ativo — torna a variabilidade de marca (Frente 2:
 * Tenant/Modulo) visível na UI, além de só existir como dado. Lê o
 * tenant ativo do Singleton\VariabilityConfig e devolve nome, cor e
 * módulos ativos, para o frontend pintar o header com a marca certa.
 */
class TenantController extends Controller
{
    public function ativo(VariabilityConfig $config): JsonResponse
    {
        $tenant = Tenant::with('modulos')->where('chave', $config->getTenant())->first();

        if ($tenant === null) {
            return response()->json(['message' => 'Tenant configurado não encontrado.'], 404);
        }

        return response()->json([
            'id' => (string) $tenant->id,
            'chave' => $tenant->chave,
            'nome' => $tenant->nome,
            'corPrimaria' => $tenant->cor_primaria,
            'modulosAtivos' => $tenant->modulos
                ->filter(fn ($modulo) => (bool) $modulo->pivot->ativo)
                ->pluck('chave')
                ->values(),
        ]);
    }
}
