<?php

namespace App\Patterns\TemplateMethod;

use App\Patterns\Singleton\VariabilityConfig;
use InvalidArgumentException;

/**
 * Resolve a chave de configuração (Singleton\VariabilityConfig) para o
 * gerador concreto — o mesmo papel que CheckInMethodFactory cumpre
 * para o Strategy: não é um quarto padrão, é a cola entre os dois.
 */
class GeradorCertificadoFactory
{
    public static function criar(string $chave): GeradorCertificado
    {
        return match ($chave) {
            'universidade' => new GeradorUniversidade(),
            'empresa' => new GeradorEmpresa(),
            'associacao' => new GeradorAssociacao(),
            default => throw new InvalidArgumentException(sprintf('Template de certificado desconhecido: "%s".', $chave)),
        };
    }

    public static function apartirDaConfiguracao(VariabilityConfig $config): GeradorCertificado
    {
        return self::criar($config->getCertificadoTemplate());
    }
}
