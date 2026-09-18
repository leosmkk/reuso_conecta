<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cracha extends Model
{
    protected $fillable = ['id_cracha', 'aluno_id', 'ativo'];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }

    public function pertenceA(Aluno $aluno): bool
    {
        return $this->aluno_id === $aluno->id;
    }
}
