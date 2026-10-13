<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use App\Support\ModuloGuard;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use RuntimeException;

/**
 * Evento acadêmico. As colunas usam snake_case (title/org/place/status
 * ficam como no contrato original) para não colidir com palavras
 * reservadas do Postgres (`order`, `time`) — a conversão para o JSON
 * camelCase que o frontend espera acontece em toApiArray().
 */
class Evento extends Model implements ApiSerializavel
{
    protected $fillable = [
        'ordem', 'title', 'org', 'date_label', 'hora', 'place',
        'status', 'seats_used', 'seats_total',
        'description', 'hours', 'category', 'speaker', 'speaker_area',
        'address', 'empresa_parceira', 'tipo_apoio',
        'data', 'hora_fim', 'palestrante_id', 'latitude', 'longitude',
    ];

    protected $casts = [
        'ordem' => 'integer',
        'seats_used' => 'integer',
        'seats_total' => 'integer',
        'data' => 'date:Y-m-d',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function inscricoes(): HasMany
    {
        return $this->hasMany(Inscricao::class);
    }

    public function palestrante(): BelongsTo
    {
        return $this->belongsTo(Palestrante::class);
    }

    public function temVaga(): bool
    {
        return $this->seats_used < $this->seats_total;
    }

    /**
     * Evento já aconteceu quando a data cadastrada é anterior a hoje —
     * regra do cancelamento de inscrição (EE08).
     */
    public function jaRealizado(): bool
    {
        return $this->data !== null && $this->data->lt(today());
    }

    /**
     * Mesma regra de ConectaCampus\Domain\Evento::inscrever() do trabalho
     * de design patterns, agora persistindo de verdade.
     */
    public function inscrever(Aluno $aluno): Inscricao
    {
        if (!$this->temVaga()) {
            throw new RuntimeException('Não há vagas disponíveis neste evento.');
        }

        $existente = $this->inscricoes()->where('aluno_id', $aluno->id)->first();
        if ($existente !== null) {
            throw new RuntimeException('Você já está inscrito neste evento.');
        }

        $inscricao = $this->inscricoes()->create([
            'aluno_id' => $aluno->id,
            'token' => Inscricao::gerarTokenPara($aluno, $this),
            'data_inscricao' => now()->toDateString(),
        ]);

        $this->increment('seats_used');

        if (!$this->temVaga()) {
            $this->update(['status' => 'lotado']);
        }

        return $inscricao;
    }

    /**
     * Cancelamento libera a vaga ocupada (RF16-RF17) e reabre o evento
     * quando ele estava lotado.
     */
    public function cancelarInscricao(Inscricao $inscricao): void
    {
        $inscricao->delete();

        $this->decrement('seats_used');

        if ($this->status === 'lotado' && $this->temVaga()) {
            $this->update(['status' => 'vagas']);
        }
    }

    /**
     * Shape exato que o backend Node antigo (azure-function/src/functions/
     * pesquisar.js) devolvia: sem envelope, chaves camelCase, _id string.
     * `address` só aparece quando o tenant ativo tem o módulo geo (ver
     * App\Support\ModuloGuard) — mesmo gate que o bloco "Local" do
     * mockup (ConectaCampus.dc.html:275).
     */
    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'order' => $this->ordem,
            'title' => $this->title,
            'org' => $this->org,
            'dateLabel' => $this->date_label,
            'time' => $this->hora,
            'place' => $this->place,
            'status' => $this->status,
            'seatsUsed' => $this->seats_used,
            'seatsTotal' => $this->seats_total,
            'description' => $this->description,
            'hours' => $this->hours,
            'category' => $this->category,
            'speaker' => $this->speaker,
            'speakerArea' => $this->speaker_area,
            'address' => ModuloGuard::possui('geo') ? $this->address : null,
            'empresaParceira' => $this->empresa_parceira,
            'tipoApoio' => $this->tipo_apoio,
            'data' => $this->data?->format('Y-m-d'),
            'horaFim' => $this->hora_fim,
            'palestranteId' => $this->palestrante_id ? (string) $this->palestrante_id : null,
            'realizado' => $this->jaRealizado(),
            'latitude' => ModuloGuard::possui('geo') ? $this->latitude : null,
            'longitude' => ModuloGuard::possui('geo') ? $this->longitude : null,
        ];
    }

    /**
     * Inverso de toApiArray(): traduz o payload camelCase que
     * EventoForm.jsx envia para as colunas snake_case do model.
     * empresaParceira/tipoApoio só são aceitos quando o tenant ativo tem
     * o módulo customField — mesmo gate do bloco extra da tela
     * "Cadastrar evento" (ConectaCampus.dc.html:373).
     */
    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'order' => 'ordem',
            'title' => 'title',
            'org' => 'org',
            'dateLabel' => 'date_label',
            'time' => 'hora',
            'place' => 'place',
            'status' => 'status',
            'seatsUsed' => 'seats_used',
            'seatsTotal' => 'seats_total',
            'description' => 'description',
            'hours' => 'hours',
            'category' => 'category',
            'speaker' => 'speaker',
            'speakerArea' => 'speaker_area',
            'address' => 'address',
            'data' => 'data',
            'horaFim' => 'hora_fim',
            'palestranteId' => 'palestrante_id',
        ];

        if (ModuloGuard::possui('geo')) {
            $mapa['latitude'] = 'latitude';
            $mapa['longitude'] = 'longitude';
        }

        if (ModuloGuard::possui('customField')) {
            $mapa['empresaParceira'] = 'empresa_parceira';
            $mapa['tipoApoio'] = 'tipo_apoio';
        }

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
