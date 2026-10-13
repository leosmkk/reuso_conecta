<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TipoResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Equivalente a azure-function/src/functions/inserir.js.
 * POST /api/inserir?tipo=eventos — 201 com corpo achatado
 * {message, _id, ...campos}.
 */
class InserirController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $tipo = $request->query('tipo', 'eventos');

        if (!TipoResolver::valido($tipo)) {
            return response()->json(['message' => 'Tipo inválido. Utilize ' . TipoResolver::tiposDisponiveis() . '.'], 400);
        }

        $body = $request->json()->all();

        if (!is_array($body) || array_is_list($body)) {
            return response()->json(['message' => 'Dados inválidos.'], 400);
        }

        $modelClass = TipoResolver::modelClass($tipo);
        $atributos = $modelClass::fromApiPayload($body);

        $registro = $modelClass::create($atributos);

        return response()->json(array_merge(
            ['message' => 'Registro inserido com sucesso.'],
            $registro->toApiArray()
        ), 201);
    }
}
