<?php

namespace App\Patterns\Singleton;

/**
 * SINGLETON — produção.
 *
 * Ponto único de leitura da variabilidade da LPS (método de check-in,
 * template de certificado, tenant ativo). Em vez de PDO/getenv direto
 * (como no exemplo didático de conectacampus/design-patterns), aqui lê
 * de config('lps.*') para se comportar bem com o cache de config do
 * Laravel — mas a estrutura do padrão é a mesma: construtor privado,
 * instância estática única, clone bloqueado.
 */
class VariabilityConfig
{
    private static ?VariabilityConfig $instance = null;

    private string $checkInMethod;

    private string $certificadoTemplate;

    private string $tenant;

    private function __construct()
    {
        $this->checkInMethod = config('lps.checkin_method');
        $this->certificadoTemplate = config('lps.certificado_template');
        $this->tenant = config('lps.tenant');
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Só para os testes de integração: força a releitura de config()
     * (ex: depois de trocar o tenant no meio de um cenário de teste).
     */
    public static function resetar(): void
    {
        self::$instance = null;
    }

    public function getCheckInMethod(): string
    {
        return $this->checkInMethod;
    }

    public function getCertificadoTemplate(): string
    {
        return $this->certificadoTemplate;
    }

    public function getTenant(): string
    {
        return $this->tenant;
    }

    private function __clone()
    {
    }

    public function __wakeup()
    {
        throw new \Exception('Não é permitido desserializar um Singleton.');
    }
}
