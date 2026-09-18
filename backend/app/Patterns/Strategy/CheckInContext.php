<?php

namespace App\Patterns\Strategy;

use App\Models\Inscricao;

/**
 * Contexto do Strategy: guarda o algoritmo em uso e permite trocá-lo em
 * runtime (setMetodo). Ao ter sucesso, persiste a Presenca de verdade e
 * a associa à Inscricao — é aqui que o padrão deixa de ser demonstração
 * e passa a gravar no Postgres.
 */
class CheckInContext
{
    public function __construct(private CheckInMethod $metodo)
    {
    }

    public function setMetodo(CheckInMethod $metodo): void
    {
        $this->metodo = $metodo;
    }

    public function getMetodoAtual(): string
    {
        return $this->metodo->nome();
    }

    public function executar(Inscricao $inscricao, array $payload): ResultadoCheckIn
    {
        $resultado = $this->metodo->confirmarPresenca($inscricao, $payload);

        if ($resultado->foiBemSucedido()) {
            $presenca = $resultado->getPresenca();
            $presenca->inscricao_id = $inscricao->id;
            $presenca->save();
        }

        return $resultado;
    }
}
