<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TipoResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Equivalente a azure-function/src/functions/pesquisar.js. Contrato:
 * GET /api/pesquisar?tipo=&id= — sem id devolve um array JSON puro
 * (nunca envelopado em {"data": [...]}), com id devolve um objeto único.
 */
class PesquisarController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $tipo = $request->query('tipo', 'eventos');

        if (!TipoResolver::valido($tipo)) {
            return response()->json(['message' => 'Tipo inválido. Utilize ' . TipoResolver::tiposDisponiveis() . '.'], 400);
        }

        $id = $request->query('id');

        if ($id === null) {
            $registros = TipoResolver::novaQuery($tipo)->get()
                ->map(fn ($registro) => $registro->toApiArray())
                ->all();

            return response()->json($registros);
        }

        if (!ctype_digit((string) $id)) {
            return response()->json(['message' => 'ID inválido.'], 400);
        }

        $registro = TipoResolver::modelClass($tipo)::find((int) $id);

        if ($registro === null) {
            return response()->json(['message' => 'Registro não encontrado.'], 404);
        }

        return response()->json($registro->toApiArray());
    }
}
