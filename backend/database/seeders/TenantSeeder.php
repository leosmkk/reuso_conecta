<?php

namespace Database\Seeders;

use App\Models\Modulo;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

/**
 * Os 3 tenants whitelabel descritos em conectacampus/Prompt.md.
 */
class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = [
            [
                'chave' => 'instituto-nortech',
                'nome' => 'Instituto Nortech',
                'cor_primaria' => '#B4234B',
                'modulos_ativos' => [],
            ],
            [
                'chave' => 'universidade-vale-verde',
                'nome' => 'Universidade Vale Verde',
                'cor_primaria' => '#0F8A6B',
                'modulos_ativos' => ['geo', 'customField'],
            ],
            [
                'chave' => 'centro-universitario-abaco',
                'nome' => 'Centro Universitário Ábaco',
                'cor_primaria' => '#6D28D9',
                'modulos_ativos' => ['geo', 'qrcode', 'advReports', 'dualSignature'],
            ],
        ];

        foreach ($tenants as $dados) {
            $tenant = Tenant::updateOrCreate(
                ['chave' => $dados['chave']],
                ['nome' => $dados['nome'], 'cor_primaria' => $dados['cor_primaria']]
            );

            foreach (Modulo::all() as $modulo) {
                $tenant->modulos()->syncWithoutDetaching([
                    $modulo->id => ['ativo' => in_array($modulo->chave, $dados['modulos_ativos'], true)],
                ]);
            }
        }
    }
}
