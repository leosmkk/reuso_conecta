<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TipoResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Equivalente a azure-function/src/functions/excluir.js.
 * DELETE /api/excluir/{id}?tipo=eventos.
 */
class ExcluirController extends Controller
{
    public function __invoke(Request $request, string $id): JsonResponse
    {
        $tipo = $request->query('tipo', 'eventos');

        if (!TipoResolver::valido($tipo)) {
            return response()->json(['message' => 'Tipo inválido. Utilize eventos ou certificados.'], 400);
        }

        if (!ctype_digit($id)) {
            return response()->json(['message' => 'ID inválido.'], 400);
        }

        $modelClass = TipoResolver::modelClass($tipo);
        $registro = $modelClass::find((int) $id);

        if ($registro === null) {
            return response()->json(['message' => 'Registro não encontrado.'], 404);
        }

        $registro->delete();

        return response()->json(['message' => 'Registro excluído com sucesso.']);
    }
}
