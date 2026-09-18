<?php

namespace App\Support;

use App\Models\Certificado;
use App\Models\Evento;
use Illuminate\Database\Eloquent\Model;

/**
 * Equivalente a azure-function/src/collection.js do backend Node antigo:
 * traduz o query param ?tipo= em uma classe de model. tipo=eventos é o
 * default (mesmo comportamento do collection.js original).
 */
class TipoResolver
{
    private const MAPA = [
        'eventos' => Evento::class,
        'certificados' => Certificado::class,
    ];

    public static function valido(string $tipo): bool
    {
        return array_key_exists($tipo, self::MAPA);
    }

    /**
     * @return class-string<Model>
     */
    public static function modelClass(string $tipo): string
    {
        return self::MAPA[$tipo];
    }

    public static function novaQuery(string $tipo)
    {
        return self::modelClass($tipo)::query()->orderBy('ordem');
    }
}
