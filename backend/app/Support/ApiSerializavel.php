<?php

namespace App\Support;

/**
 * Contrato que todo Model registrado em TipoResolver::MAPA precisa
 * implementar. Antes desta interface, PesquisarController/InserirController/
 * AlterarController chamavam toApiArray()/fromApiPayload() por duck typing —
 * esquecer um método só falhava em runtime com "Call to undefined method".
 */
interface ApiSerializavel
{
    /**
     * Shape camelCase que a API devolve (sempre com '_id' string).
     */
    public function toApiArray(): array;

    /**
     * Inverso de toApiArray(): traduz o payload camelCase do frontend para
     * as colunas snake_case do model. Deve copiar só as chaves presentes em
     * $dados, para servir tanto o insert quanto o update parcial.
     */
    public static function fromApiPayload(array $dados): array;

    /**
     * Coluna (ou expressão) usada em TipoResolver::novaQuery() para
     * ordenar a listagem de GET /api/pesquisar?tipo=. Nem toda tabela tem
     * uma coluna "ordem" (só Evento e Certificado têm), então cada Model
     * declara a sua própria.
     */
    public static function ordenacaoPadrao(): string;
}
