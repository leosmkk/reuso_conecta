<?php

namespace App\Models;

use App\Support\ApiSerializavel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Inscricao extends Model implements ApiSerializavel
{
    // Eloquent pluralizaria "Inscricao" para "inscricaos" (regra em
    // inglês); a tabela real, criada pela migration, é "inscricoes".
    protected $table = 'inscricoes';

    protected $fillable = ['aluno_id', 'evento_id', 'token', 'data_inscricao'];

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Evento::class);
    }

    public function presenca(): HasOne
    {
        return $this->hasOne(Presenca::class);
    }

    public function tokenConfere(string $tokenInformado): bool
    {
        return hash_equals($this->token, $tokenInformado);
    }

    public function temPresenca(): bool
    {
        return $this->presenca()->exists();
    }

    public function podeReceberCertificado(): bool
    {
        return $this->temPresenca();
    }

    /**
     * Token determinístico (matrícula + id do evento), igual ao método
     * Inscricao::gerarToken() do trabalho de design patterns — assim o
     * seeder e os testes manuais são reproduzíveis.
     */
    public static function gerarTokenPara(Aluno $aluno, Evento $evento): string
    {
        return strtoupper(substr(md5($aluno->matricula . '-' . $evento->id), 0, 8));
    }

    /**
     * alunoNome/eventoTitulo são read-only (não entram em fromApiPayload)
     * — só para a tela de Inscrições não mostrar IDs crus na tabela.
     */
    public function toApiArray(): array
    {
        return [
            '_id' => (string) $this->id,
            'alunoId' => (string) $this->aluno_id,
            'eventoId' => (string) $this->evento_id,
            'token' => $this->token,
            'dataInscricao' => $this->data_inscricao,
            'alunoNome' => $this->aluno?->nome,
            'eventoTitulo' => $this->evento?->title,
        ];
    }

    public static function fromApiPayload(array $dados): array
    {
        $mapa = [
            'alunoId' => 'aluno_id',
            'eventoId' => 'evento_id',
            'token' => 'token',
            'dataInscricao' => 'data_inscricao',
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
        return 'id';
    }
}
