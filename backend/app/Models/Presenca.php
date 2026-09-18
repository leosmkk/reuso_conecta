<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presenca extends Model
{
    protected $fillable = ['inscricao_id', 'data_hora', 'metodo', 'registrado_por'];

    public function inscricao(): BelongsTo
    {
        return $this->belongsTo(Inscricao::class);
    }

    public function resumo(): string
    {
        return sprintf('%s às %s (confirmado por %s)', $this->metodo, $this->data_hora, $this->registrado_por);
    }
}
