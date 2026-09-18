<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Inscricao extends Model
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
}
