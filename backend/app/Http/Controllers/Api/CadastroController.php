<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CentroAcademico;
use App\Models\Palestrante;
use App\Models\User;
use App\Support\CadastroUsuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Cadastros restritos por perfil: centro acadêmico, feito pela
 * Universidade (EE05 / RF06), e palestrante, feito pelo Centro
 * Acadêmico (EE06 / RF07). Cada um cria a entidade e o acesso.
 */
class CadastroController extends Controller
{
    public function centro(Request $request): JsonResponse
    {
        if (CadastroUsuario::camposFaltando($request, ['nome', 'curso', 'email', 'senha', 'presidente', 'vicePresidente', 'integrantes'])) {
            return CadastroUsuario::respostaCamposObrigatorios();
        }

        $email = trim((string) $request->input('email'));

        if (CadastroUsuario::emailEmUso($email)) {
            return CadastroUsuario::respostaEmailEmUso();
        }

        $centro = DB::transaction(function () use ($request, $email) {
            $centro = CentroAcademico::create(CentroAcademico::fromApiPayload($request->except('senha')));

            User::create([
                'name' => $centro->nome,
                'email' => $email,
                'password' => (string) $request->input('senha'),
                'perfil' => 'centro',
                'centro_academico_id' => $centro->id,
            ]);

            return $centro;
        });

        return response()->json(array_merge(
            ['message' => 'Centro Acadêmico cadastrado com sucesso.'],
            $centro->toApiArray()
        ), 201);
    }

    public function palestrante(Request $request): JsonResponse
    {
        if (CadastroUsuario::camposFaltando($request, ['nome', 'email', 'senha', 'areaAtuacao'])) {
            return CadastroUsuario::respostaCamposObrigatorios();
        }

        $email = trim((string) $request->input('email'));

        if (CadastroUsuario::emailEmUso($email)) {
            return CadastroUsuario::respostaEmailEmUso();
        }

        $palestrante = DB::transaction(function () use ($request, $email) {
            $palestrante = Palestrante::create(Palestrante::fromApiPayload($request->except('senha')));

            User::create([
                'name' => $palestrante->nome,
                'email' => $email,
                'password' => (string) $request->input('senha'),
                'perfil' => 'palestrante',
                'palestrante_id' => $palestrante->id,
            ]);

            return $palestrante;
        });

        return response()->json(array_merge(
            ['message' => 'Palestrante cadastrado com sucesso.'],
            $palestrante->toApiArray()
        ), 201);
    }
}
