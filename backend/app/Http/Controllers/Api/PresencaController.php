<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evento;
use App\Models\Inscricao;
use App\Models\Presenca;
use App\Patterns\Strategy\CheckInContext;
use App\Patterns\Strategy\QrCodeCheckIn;
use App\Support\ModuloGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Validação de presença pelo QR Code do aluno (EE09 / RF24-RF26). Usa a
 * estratégia QrCodeCheckIn (Strategy) e só existe para tenants com o
 * módulo qrcode.
 */
class PresencaController extends Controller
{
    public function validar(Request $request): JsonResponse
    {
        if (!ModuloGuard::possui('qrcode')) {
            return response()->json([
                'message' => 'Validação de presença por QR Code não faz parte da contratação deste tenant.',
            ], 403);
        }

        $evento = Evento::find((int) $request->input('evento_id'));
        if ($evento === null) {
            return response()->json(['message' => 'Evento não encontrado.'], 404);
        }

        $token = strtoupper(trim((string) $request->input('token')));
        $inscricao = $token === ''
            ? null
            : Inscricao::with('aluno')->where('evento_id', $evento->id)->where('token', $token)->first();

        if ($inscricao === null) {
            return response()->json(['message' => 'QR Code inválido para este evento.'], 400);
        }

        if ($inscricao->temPresenca()) {
            return response()->json(['message' => 'A presença deste aluno já foi validada.'], 409);
        }

        $context = new CheckInContext(new QrCodeCheckIn());
        $resultado = $context->executar($inscricao, ['token' => $token]);

        if (!$resultado->foiBemSucedido()) {
            return response()->json(['message' => 'QR Code inválido para este evento.'], 400);
        }

        return response()->json([
            'message' => 'Presença validada com sucesso.',
            'aluno' => $inscricao->aluno->toApiArray(),
            'evento' => $evento->toApiArray(),
            'presenca' => $inscricao->presenca()->first()->toApiArray(),
        ]);
    }

    public function doEvento(int $eventoId): JsonResponse
    {
        $presencas = Presenca::with('inscricao.aluno')
            ->whereHas('inscricao', fn ($q) => $q->where('evento_id', $eventoId))
            ->orderBy('id')
            ->get();

        return response()->json($presencas->map(fn (Presenca $presenca) => array_merge($presenca->toApiArray(), [
            'alunoNome' => $presenca->inscricao->aluno->nome,
            'matricula' => $presenca->inscricao->aluno->matricula,
            'curso' => $presenca->inscricao->aluno->curso,
        ]))->values());
    }
}
