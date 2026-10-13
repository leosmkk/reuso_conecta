<?php

namespace App\Support;

use App\Models\Aluno;
use App\Models\CentroAcademico;
use App\Models\Palestrante;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Regras comuns dos cadastros EE04-EE06: campos obrigatórios e e-mail
 * único em todos os perfis (um e-mail é uma identidade de acesso só).
 */
class CadastroUsuario
{
    /**
     * @param  list<string>  $obrigatorios
     */
    public static function camposFaltando(Request $request, array $obrigatorios): bool
    {
        foreach ($obrigatorios as $campo) {
            $valor = $request->input($campo);
            if ($valor === null || trim((string) $valor) === '') {
                return true;
            }
        }

        return false;
    }

    public static function emailEmUso(string $email): bool
    {
        return User::where('email', $email)->exists()
            || Aluno::where('email', $email)->exists()
            || CentroAcademico::where('email', $email)->exists()
            || Palestrante::where('email', $email)->exists();
    }

    public static function respostaCamposObrigatorios(): JsonResponse
    {
        return response()->json(['message' => 'Preencha todos os campos obrigatórios.'], 400);
    }

    public static function respostaEmailEmUso(): JsonResponse
    {
        return response()->json(['message' => 'Este e-mail já está sendo utilizado.'], 409);
    }
}
