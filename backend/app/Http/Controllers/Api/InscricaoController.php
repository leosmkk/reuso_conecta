<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aluno;
use App\Models\Certificado;
use App\Models\Evento;
use App\Models\Inscricao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Inscrição e cancelamento do aluno (EE07 / EE08, RF11-RF17) e a lista
 * "Minhas inscrições". As regras de vaga ficam em Evento::inscrever() e
 * Evento::cancelarInscricao().
 */
class InscricaoController extends Controller
{
    public function inscrever(Request $request, int $eventoId): JsonResponse
    {
        $aluno = Aluno::find((int) $request->input('aluno_id'));
        if ($aluno === null) {
            return response()->json(['message' => 'Aluno não encontrado.'], 404);
        }

        try {
            $inscricao = DB::transaction(function () use ($eventoId, $aluno) {
                $evento = Evento::lockForUpdate()->find($eventoId);
                if ($evento === null) {
                    throw new RuntimeException('Evento não encontrado.', 404);
                }

                return $evento->inscrever($aluno);
            });
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() === 404 ? 404 : 409);
        }

        $inscricao->load('evento');

        return response()->json([
            'message' => 'Inscrição realizada. Uma vaga foi reservada.',
            'inscricao' => $inscricao->toApiArray(),
            'evento' => $inscricao->evento->toApiArray(),
        ], 201);
    }

    public function cancelar(int $id): JsonResponse
    {
        $inscricao = Inscricao::with('evento')->find($id);
        if ($inscricao === null) {
            return response()->json(['message' => 'Inscrição não encontrada.'], 404);
        }

        if ($inscricao->evento->jaRealizado()) {
            return response()->json(['message' => 'Cancelamento indisponível: o evento já foi realizado.'], 409);
        }

        if ($inscricao->temPresenca()) {
            return response()->json(['message' => 'Cancelamento indisponível: a presença já foi validada.'], 409);
        }

        $evento = $inscricao->evento;
        DB::transaction(fn () => $evento->cancelarInscricao($inscricao));

        return response()->json([
            'message' => 'Inscrição cancelada. A vaga foi liberada.',
            'evento' => $evento->fresh()->toApiArray(),
        ]);
    }

    public function doAluno(int $alunoId): JsonResponse
    {
        $inscricoes = Inscricao::with(['evento', 'presenca'])
            ->where('aluno_id', $alunoId)
            ->orderBy('id')
            ->get();

        $certificados = Certificado::whereIn('inscricao_id', $inscricoes->pluck('id'))
            ->get()
            ->keyBy('inscricao_id');

        return response()->json($inscricoes->map(function (Inscricao $inscricao) use ($certificados) {
            $certificado = $certificados->get($inscricao->id);

            return array_merge($inscricao->toApiArray(), [
                'evento' => $inscricao->evento->toApiArray(),
                'presente' => $inscricao->presenca !== null,
                'certificado' => $certificado?->toApiArray(),
            ]);
        })->values());
    }
}
