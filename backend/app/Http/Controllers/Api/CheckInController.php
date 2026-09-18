<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aluno;
use App\Models\Cracha;
use App\Models\Evento;
use App\Patterns\Singleton\VariabilityConfig;
use App\Patterns\Strategy\CheckInContext;
use App\Patterns\Strategy\CheckInMethodFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * POST /api/checkin — botão "Confirmar presença" da agenda.
 *
 * A tela atual não tem login/seleção de aluno, então este endpoint
 * opera sempre sobre o aluno DEMO-0001 (semeado por AlunoSeeder): acha
 * ou cria a inscrição dele no evento informado e roda o CheckInContext
 * com a estratégia que VariabilityConfig::getCheckInMethod() escolher
 * — troque CHECKIN_METHOD no .env para ver outra estratégia responder.
 */
class CheckInController extends Controller
{
    public function __invoke(Request $request, VariabilityConfig $config): JsonResponse
    {
        $eventoId = $request->input('evento_id');

        if (!is_numeric($eventoId)) {
            return response()->json(['message' => 'evento_id é obrigatório.'], 400);
        }

        $evento = Evento::find((int) $eventoId);
        if ($evento === null) {
            return response()->json(['message' => 'Evento não encontrado.'], 404);
        }

        $aluno = Aluno::where('matricula', 'DEMO-0001')->firstOrFail();

        $inscricao = $evento->inscricoes()->where('aluno_id', $aluno->id)->first();
        if ($inscricao === null) {
            try {
                $inscricao = $evento->inscrever($aluno);
            } catch (RuntimeException $e) {
                return response()->json(['message' => $e->getMessage()], 409);
            }
        }

        $crachas = Cracha::where('aluno_id', $aluno->id)->get();
        $metodo = CheckInMethodFactory::apartirDaConfiguracao($config, $crachas);
        $context = new CheckInContext($metodo);

        $payload = $request->except('evento_id');
        $resultado = $context->executar($inscricao, $payload);

        return response()->json([
            'message' => $resultado->getMensagem(),
            'metodo' => $context->getMetodoAtual(),
            'sucesso' => $resultado->foiBemSucedido(),
        ], $resultado->foiBemSucedido() ? 200 : 422);
    }
}
