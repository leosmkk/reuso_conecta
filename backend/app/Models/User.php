<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'perfil', 'aluno_id', 'centro_academico_id', 'palestrante_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const PERFIS = ['aluno', 'centro', 'universidade', 'palestrante'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }

    public function centroAcademico(): BelongsTo
    {
        return $this->belongsTo(CentroAcademico::class);
    }

    public function palestrante(): BelongsTo
    {
        return $this->belongsTo(Palestrante::class);
    }

    /**
     * Contrato devolvido pelo login: só o que o frontend precisa para
     * montar o menu do perfil e filtrar as telas (nunca a senha).
     */
    public function toSessaoArray(): array
    {
        return [
            'id' => (string) $this->id,
            'nome' => $this->name,
            'email' => $this->email,
            'perfil' => $this->perfil,
            'alunoId' => $this->aluno_id ? (string) $this->aluno_id : null,
            'centroAcademicoId' => $this->centro_academico_id ? (string) $this->centro_academico_id : null,
            'palestranteId' => $this->palestrante_id ? (string) $this->palestrante_id : null,
        ];
    }
}
