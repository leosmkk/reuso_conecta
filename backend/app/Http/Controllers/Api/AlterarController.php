<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TipoResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Equivalente a azure-function/src/functions/alterar.js.
 * PUT /api/alterar/{id}?tipo=eventos — merge parcial (equivalente ao
 * $set do Mongo), 200 com {message, registro: {...}}.
 */
class AlterarController extends Controller
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

        $body = $request->json()->all();

        if (!is_array($body) || array_is_list($body)) {
            return response()->json(['message' => 'Dados inválidos.'], 400);
        }

        $modelClass = TipoResolver::modelClass($tipo);
        $registro = $modelClass::find((int) $id);

        if ($registro === null) {
            return response()->json(['message' => 'Registro não encontrado.'], 404);
        }

        $registro->update($modelClass::fromApiPayload($body));

        return response()->json([
            'message' => 'Registro alterado com sucesso.',
            'registro' => $registro->fresh()->toApiArray(),
        ]);
    }
}
