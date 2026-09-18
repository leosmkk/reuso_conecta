<?php

namespace App\Patterns\TemplateMethod;

use App\Models\Certificado;

/**
 * TEMPLATE METHOD — produção (base dos 3 exemplos).
 *
 * Mesmo esqueleto de conectacampus/design-patterns: cabeçalho → corpo
 * → assinatura → rodapé, com gerar() final. Aqui opera sobre o model
 * Eloquent App\Models\Certificado (via App\Models\Inscricao ligada a
 * ele) em vez da entidade de domínio didática.
 */
abstract class GeradorCertificado
{
    final public function gerar(Certificado $certificado): string
    {
        return implode("\n", [
            $this->montarCabecalho($certificado),
            $this->montarCorpo($certificado),
            $this->montarAssinatura($certificado),
            $this->montarRodape($certificado),
        ]);
    }

    abstract protected function montarCabecalho(Certificado $certificado): string;

    abstract protected function montarCorpo(Certificado $certificado): string;

    abstract protected function montarAssinatura(Certificado $certificado): string;

    /**
     * Hook opcional — só GeradorEmpresa sobrescreve.
     */
    protected function montarRodape(Certificado $certificado): string
    {
        return sprintf('Código de validação: %s', $certificado->codigoValidacao());
    }
}
