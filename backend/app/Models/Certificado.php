<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Serve dois papéis, de propósito:
 *
 * 1. Catálogo exibido em CertificatesPage.jsx — os campos planos
 *    (ordem/title/hours/completed_at/status), exatamente como em
 *    conectacampus/mongodb-seed/certificados.json.
 * 2. Quando `inscricao_id` está preenchido, é o objeto real que os
 *    geradores de App\Patterns\TemplateMethod renderizam (endpoint
 *    GET /api/certificados/{id}/documento).
 *
 * `status` também carrega o fluxo de dupla assinatura do módulo
 * dualSignature: disponivel -> aguardando_reitoria -> assinado (ver
 * CertificadoController::documento).
 */
class Certificado extends Model implements ApiSerializavel
{
    protected $fillable = [
        'ordem', 'title', 'hours', 'completed_at', 'status',
        'inscricao_id', 'codigo', 'emitido_por', 'assinante',
    ];

    protected $casts = [
        'ordem' => 'integer',
    ];

    public function inscricao(): BelongsTo
    {
        return $this->belongsTo(Inscricao::class);
    }

    public function podeGerarDocumento(): bool
    {
        return $this->inscricao_id !== null && $this->inscricao->podeReceberCertificado();
    }

    public function getAluno(): ?Aluno
    {
        return $this->inscricao?->aluno;
    }

    public function getEvento(): ?Evento
    {
        return $this->inscricao?->evento;
    }

    public function codigoValidacao(): string
    {
        $base = $this->codigo ?? (string) $this->id;

        return sprintf('CC-%s-%s', strtoupper($base), strtoupper(substr(md5($base), 0, 6)));
    }

    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'order' => $this->ordem,
            'title' => $this->title,
            'hours' => $this->hours,
            'completedAt' => $this->completed_at,
            'status' => $this->status,
        ];
    }

    /**
     * Inverso de toApiArray() — mesmo papel de Evento::fromApiPayload().
     */
    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'order' => 'ordem',
            'title' => 'title',
            'hours' => 'hours',
            'completedAt' => 'completed_at',
            'status' => 'status',
        ];

        $atributos = [];
        foreach ($mapa as $chaveJson => $coluna) {
            if (array_key_exists($chaveJson, $dados)) {
                $atributos[$coluna] = $dados[$chaveJson];
            }
        }

        return $atributos;
    }

    public static function ordenacaoPadrao(): string
    {
        return 'ordem';
    }
}
