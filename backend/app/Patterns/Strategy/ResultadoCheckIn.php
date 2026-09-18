<?php

namespace App\Patterns\Strategy;

use App\Models\Presenca;

/**
 * Value object devolvido por qualquer CheckInMethod.
 */
class ResultadoCheckIn
{
    private function __construct(
        private readonly bool $sucesso,
        private readonly string $mensagem,
        private readonly ?Presenca $presenca
    ) {
    }

    public static function sucesso(string $mensagem, Presenca $presenca): self
    {
        return new self(true, $mensagem, $presenca);
    }

    public static function falha(string $mensagem): self
    {
        return new self(false, $mensagem, null);
    }

    public function foiBemSucedido(): bool
    {
        return $this->sucesso;
    }

    public function getMensagem(): string
    {
        return $this->mensagem;
    }

    public function getPresenca(): ?Presenca
    {
        return $this->presenca;
    }
}
