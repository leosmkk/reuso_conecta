<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aluno extends Model
{
    protected $fillable = ['nome', 'email', 'telefone', 'matricula', 'curso', 'semestre'];

    public function inscricoes(): HasMany
    {
        return $this->hasMany(Inscricao::class);
    }

    public function crachas(): HasMany
    {
        return $this->hasMany(Cracha::class);
    }
}
