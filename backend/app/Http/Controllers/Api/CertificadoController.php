<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificado;
use App\Models\Inscricao;
use App\Patterns\Singleton\VariabilityConfig;
use App\Patterns\TemplateMethod\GeradorCertificadoFactory;
use App\Support\ModuloGuard;
use Illuminate\Http\JsonResponse;

/**
 * GET /api/certificados/{id}/documento — botão "Gerar certificado" de
 * CertificatesPage.jsx (hoje sem handler). Escolhe o gerador conforme
 * VariabilityConfig::getCertificadoTemplate() e roda o Template Method
 * de verdade sobre o Certificado + Inscricao do banco.
 */
class CertificadoController extends Controller
{
    public function documento(int $id, VariabilityConfig $config): JsonResponse
    {
        $certificado = Certificado::find($id);

        if ($certificado === null) {
            return response()->json(['message' => 'Certificado não encontrado.'], 404);
        }

        if (!$certificado->podeGerarDocumento()) {
            return response()->json([
                'message' => 'Este certificado ainda não pode ser gerado: presença não confirmada.',
            ], 422);
        }

        // Módulo dualSignature (ConectaCampus.dc.html:324-350): quando o
        // tenant contratou o fluxo de dupla assinatura, o documento só sai
        // depois que a Reitoria assinar (status muda para "assinado" pelo
        // CRUD de Certificados).
        if (ModuloGuard::possui('dualSignature') && $certificado->status !== 'assinado') {
            return response()->json([
                'message' => 'Este certificado aguarda a assinatura da Reitoria.',
            ], 422);
        }

        $gerador = GeradorCertificadoFactory::apartirDaConfiguracao($config);

        return response()->json([
            'message' => 'Certificado gerado com sucesso.',
            'template' => $config->getCertificadoTemplate(),
            'documento' => $gerador->gerar($certificado),
        ]);
    }

    /**
     * SE02 — emite o certificado de uma inscrição com presença validada
     * (RF35-RF36). Com o módulo dualSignature ele nasce aguardando a
     * assinatura da Reitoria; sem o módulo já fica disponível.
     */
    public function emitir(int $inscricaoId): JsonResponse
    {
        $inscricao = Inscricao::with(['evento', 'aluno'])->find($inscricaoId);

        if ($inscricao === null) {
            return response()->json(['message' => 'Inscrição não encontrada.'], 404);
        }

        if (!$inscricao->podeReceberCertificado()) {
            return response()->json([
                'message' => 'Certificado indisponível: presença não validada neste evento.',
            ], 422);
        }

        $certificado = Certificado::firstOrNew(['inscricao_id' => $inscricao->id]);

        if (!$certificado->exists) {
            $evento = $inscricao->evento;

            $certificado->fill([
                'ordem' => (int) Certificado::max('ordem') + 1,
                'title' => $evento->title,
                'hours' => $evento->hours,
                'completed_at' => 'concluído em ' . $evento->date_label,
                'status' => ModuloGuard::possui('dualSignature') ? 'aguardando_reitoria' : 'disponivel',
                'codigo' => strtoupper(substr(md5('certificado-' . $inscricao->id), 0, 4)),
                'emitido_por' => 'Secretaria Acadêmica',
                'assinante' => 'Reitoria',
            ])->save();
        }

        return response()->json([
            'message' => 'Certificado emitido.',
            'certificado' => $certificado->toApiArray(),
        ], 201);
    }

    /**
     * Assinatura da Reitoria (tela Aprovação): libera o documento dos
     * certificados que aguardam o fluxo de dupla assinatura.
     */
    public function assinar(int $id): JsonResponse
    {
        if (!ModuloGuard::possui('dualSignature')) {
            return response()->json([
                'message' => 'Certificado com dupla aprovação não faz parte da contratação deste tenant.',
            ], 403);
        }

        $certificado = Certificado::find($id);

        if ($certificado === null) {
            return response()->json(['message' => 'Certificado não encontrado.'], 404);
        }

        if ($certificado->status === 'assinado') {
            return response()->json(['message' => 'Este certificado já foi assinado.'], 409);
        }

        $certificado->update(['status' => 'assinado', 'assinante' => 'Reitoria']);

        return response()->json([
            'message' => 'Certificado assinado pela Reitoria.',
            'certificado' => $certificado->toApiArray(),
        ]);
    }
}
