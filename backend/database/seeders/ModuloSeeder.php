<?php

namespace Database\Seeders;

use App\Models\Modulo;
use Illuminate\Database\Seeder;

class ModuloSeeder extends Seeder
{
    public function run(): void
    {
        $modulos = [
            ['chave' => 'geo', 'nome' => 'Geolocalização', 'descricao' => 'Restringe check-in por proximidade do local'],
            ['chave' => 'qrcode', 'nome' => 'Check-in por QR Code', 'descricao' => 'Habilita confirmação de presença via QR Code'],
            ['chave' => 'advReports', 'nome' => 'Relatórios avançados', 'descricao' => 'Painéis gerenciais de participação'],
            ['chave' => 'dualSignature', 'nome' => 'Dupla assinatura', 'descricao' => 'Aprovação de certificado em duas etapas'],
            ['chave' => 'customField', 'nome' => 'Campo personalizado', 'descricao' => 'Campo extra configurável no cadastro'],
        ];

        foreach ($modulos as $modulo) {
            Modulo::updateOrCreate(['chave' => $modulo['chave']], $modulo);
        }
    }
}
