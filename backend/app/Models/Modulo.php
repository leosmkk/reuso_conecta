<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Feature flag da LPS (geo, qrcode, advReports, dualSignature, customField).
 */
class Modulo extends Model
{
    protected $fillable = ['chave', 'nome', 'descricao'];
}
