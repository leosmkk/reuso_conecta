<?php

namespace App\Patterns\TemplateMethod;

use App\Models\Certificado;

class GeradorAssociacao extends GeradorCertificado
{
    protected function montarCabecalho(Certificado $certificado): string
    {
        return '=== Certificado de Participação (Associação Profissional) ===';
    }

    protected function montarCorpo(Certificado $certificado): string
    {
        $aluno = $certificado->getAluno();
        $evento = $certificado->getEvento();

        return sprintf(
            'Certificamos que %s participou do congresso "%s", com carga horária de %s.',
            $aluno->nome,
            $evento->title,
            $certificado->hours ?? '—'
        );
    }

    protected function montarAssinatura(Certificado $certificado): string
    {
        return 'Diretoria da Associação — ' . ($certificado->emitido_por ?? 'Secretaria');
    }
}
