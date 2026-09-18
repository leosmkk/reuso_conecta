<?php

namespace App\Patterns\Strategy;

use App\Patterns\Singleton\VariabilityConfig;
use Illuminate\Support\Collection;
use InvalidArgumentException;

/**
 * Resolve a chave de configuração (Singleton\VariabilityConfig) para a
 * estratégia concreta — a cola entre o Singleton e o Strategy, não um
 * quarto padrão. Espelha App\Patterns\TemplateMethod\GeradorCertificadoFactory.
 */
class CheckInMethodFactory
{
    /**
     * @param Collection<int, \App\Models\Cracha>|\App\Models\Cracha[] $crachas usado só quando $chave === 'nfc'
     */
    public static function criar(string $chave, iterable $crachas = []): CheckInMethod
    {
        return match ($chave) {
            'qrcode' => new QrCodeCheckIn(),
            'manual' => new ManualCheckIn(),
            'nfc' => new NfcCheckIn($crachas),
            default => throw new InvalidArgumentException(sprintf('Método de check-in desconhecido: "%s".', $chave)),
        };
    }

    public static function apartirDaConfiguracao(VariabilityConfig $config, iterable $crachas = []): CheckInMethod
    {
        return self::criar($config->getCheckInMethod(), $crachas);
    }
}
