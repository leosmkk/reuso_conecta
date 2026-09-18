<?php

namespace App\Patterns\TemplateMethod;

use App\Models\Certificado;

class GeradorEmpresa extends GeradorCertificado
{
    protected function montarCabecalho(Certificado $certificado): string
    {
        return '=== Certificado de Conclusão (Empresa) ===';
    }

    protected function montarCorpo(Certificado $certificado): string
    {
        $aluno = $certificado->getAluno();
        $evento = $certificado->getEvento();

        return sprintf(
            'Certificamos que %s (matrícula interna %s) concluiu o treinamento "%s", com carga horária de %s.',
            $aluno->nome,
            $aluno->matricula,
            $evento->title,
            $certificado->hours ?? '—'
        );
    }

    protected function montarAssinatura(Certificado $certificado): string
    {
        return ($certificado->assinante ?? 'Gerência de RH') . ' — RH';
    }

    protected function montarRodape(Certificado $certificado): string
    {
        return sprintf('Válido apenas para fins internos de treinamento. Código: %s', $certificado->codigoValidacao());
    }
}
