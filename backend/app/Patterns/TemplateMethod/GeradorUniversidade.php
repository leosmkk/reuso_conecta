<?php

namespace App\Patterns\TemplateMethod;

use App\Models\Certificado;

class GeradorUniversidade extends GeradorCertificado
{
    protected function montarCabecalho(Certificado $certificado): string
    {
        return '=== Certificado de Participação (Universidade) ===';
    }

    protected function montarCorpo(Certificado $certificado): string
    {
        $aluno = $certificado->getAluno();
        $evento = $certificado->getEvento();

        return sprintf(
            'Certificamos que %s (matrícula %s, curso %s) participou do evento "%s", com carga horária de %s.',
            $aluno->nome,
            $aluno->matricula,
            $aluno->curso,
            $evento->title,
            $certificado->hours ?? '—'
        );
    }

    protected function montarAssinatura(Certificado $certificado): string
    {
        return 'Reitoria — ' . ($certificado->emitido_por ?? 'Secretaria Acadêmica');
    }
}
