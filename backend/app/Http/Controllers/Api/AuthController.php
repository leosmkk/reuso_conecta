<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aluno;
use App\Models\User;
use App\Support\CadastroUsuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Login por perfil (aluno, centro, universidade, palestrante) e o
 * cadastro de estudante (EE04 / RF05). Sem token: o frontend guarda o
 * usuário devolvido e o envia nas rotas que precisam do aluno.
 */
class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $email = trim((string) $request->input('email'));
        $senha = (string) $request->input('senha');

        $usuario = User::where('email', $email)->first();

        if ($usuario === null || !Hash::check($senha, $usuario->password)) {
            return response()->json(['message' => 'E-mail ou senha inválidos.'], 401);
        }

        return response()->json(['usuario' => $usuario->toSessaoArray()]);
    }

    public function cadastroAluno(Request $request): JsonResponse
    {
        if (CadastroUsuario::camposFaltando($request, ['nome', 'nascimento', 'matricula', 'curso', 'email', 'senha'])) {
            return CadastroUsuario::respostaCamposObrigatorios();
        }

        $email = trim((string) $request->input('email'));
        $matricula = trim((string) $request->input('matricula'));

        if (CadastroUsuario::emailEmUso($email)) {
            return CadastroUsuario::respostaEmailEmUso();
        }

        if (Aluno::where('matricula', $matricula)->exists()) {
            return response()->json(['message' => 'Esta matrícula já está cadastrada.'], 409);
        }

        $usuario = DB::transaction(function () use ($request, $email, $matricula) {
            $aluno = Aluno::create([
                'nome' => trim((string) $request->input('nome')),
                'email' => $email,
                'matricula' => $matricula,
                'curso' => trim((string) $request->input('curso')),
                'nascimento' => $request->input('nascimento'),
            ]);

            return User::create([
                'name' => $aluno->nome,
                'email' => $email,
                'password' => (string) $request->input('senha'),
                'perfil' => 'aluno',
                'aluno_id' => $aluno->id,
            ]);
        });

        return response()->json([
            'message' => 'Cadastro realizado com sucesso.',
            'usuario' => $usuario->toSessaoArray(),
        ], 201);
    }
}
