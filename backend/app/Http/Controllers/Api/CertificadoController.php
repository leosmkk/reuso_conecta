<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificado;
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
}
