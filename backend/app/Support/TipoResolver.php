<?php

namespace App\Support;

use App\Models\Aluno;
use App\Models\Certificado;
use App\Models\Cracha;
use App\Models\Evento;
use App\Models\Inscricao;
use App\Models\Modulo;
use App\Models\Presenca;
use App\Models\Tenant;
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
        'alunos' => Aluno::class,
        'inscricoes' => Inscricao::class,
        'presencas' => Presenca::class,
        'crachas' => Cracha::class,
        'tenants' => Tenant::class,
        'modulos' => Modulo::class,
    ];

    public static function valido(string $tipo): bool
    {
        return array_key_exists($tipo, self::MAPA);
    }

    /**
     * @return class-string<Model&ApiSerializavel>
     */
    public static function modelClass(string $tipo): string
    {
        return self::MAPA[$tipo];
    }

    public static function novaQuery(string $tipo)
    {
        $modelClass = self::modelClass($tipo);

        return $modelClass::query()->orderBy($modelClass::ordenacaoPadrao());
    }

    /**
     * Lista legível dos tipos válidos, para as mensagens de erro 400 dos
     * controllers CRUD (ex.: "Tipo inválido. Utilize eventos, certificados, ...").
     */
    public static function tiposDisponiveis(): string
    {
        return implode(', ', array_keys(self::MAPA));
    }
}
