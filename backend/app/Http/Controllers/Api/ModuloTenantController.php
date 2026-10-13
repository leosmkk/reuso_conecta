<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Modulo;
use App\Models\Tenant;
use App\Support\ModuloGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * PUT /api/tenants/{tenantId}/modulos/{moduloChave} — o switch da tela
 * Central de Módulos (ConectaCampus.dc.html:518-544). Grava no pivot
 * tenant_modulo e é o que faz a variabilidade de módulo da LPS ficar
 * editável em runtime pela UI, não só via .env + restart do container.
 */
class ModuloTenantController extends Controller
{
    public function alternar(Request $request, int $tenantId, string $moduloChave): JsonResponse
    {
        $tenant = Tenant::find($tenantId);
        if ($tenant === null) {
            return response()->json(['message' => 'Tenant não encontrado.'], 404);
        }

        $modulo = Modulo::where('chave', $moduloChave)->first();
        if ($modulo === null) {
            return response()->json(['message' => 'Módulo não encontrado.'], 404);
        }

        $ativo = $request->boolean('ativo');

        $tenant->modulos()->syncWithoutDetaching([
            $modulo->id => ['ativo' => $ativo],
        ]);

        // O tenant ativo pode ser justamente este — invalida o cache do
        // ModuloGuard para a próxima leitura (ex.: GET /api/tenant-ativo
        // logo em seguida) já refletir o toggle.
        ModuloGuard::resetar();

        return response()->json([
            'message' => $ativo
                ? sprintf('Módulo "%s" ativado para %s.', $modulo->nome, $tenant->nome)
                : sprintf('Módulo "%s" desativado para %s.', $modulo->nome, $tenant->nome),
            'tenantId' => (string) $tenant->id,
            'moduloChave' => $modulo->chave,
            'ativo' => $ativo,
        ]);
    }
}
