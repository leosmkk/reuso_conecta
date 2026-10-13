<?php

namespace Database\Seeders;

use App\Models\Aluno;
use App\Models\Certificado;
use App\Models\Evento;
use Illuminate\Database\Seeder;

class CertificadoSeeder extends Seeder
{
    public function run(): void
    {
        // Catálogo plano, cópia de conectacampus/mongodb-seed/certificados.json
        // — é o que CertificatesPage.jsx lista hoje. status varia pelo fluxo
        // de dupla assinatura do módulo dualSignature (disponivel ->
        // aguardando_reitoria -> assinado), para a timeline do mockup
        // (ConectaCampus.dc.html:328-350) ter o que mostrar assim que o
        // banco é semeado.
        $catalogo = [
            [
                'ordem' => 1,
                'title' => 'Semana de Tecnologia 2026',
                'hours' => '12h',
                'completed_at' => 'concluído em 14 de setembro de 2026',
                'status' => 'aguardando_reitoria',
            ],
            [
                'ordem' => 2,
                'title' => 'Palestra: Ética em Inteligência Artificial',
                'hours' => '2h',
                'completed_at' => 'concluído em 18 de setembro de 2026',
                'status' => 'disponivel',
            ],
        ];

        foreach ($catalogo as $certificado) {
            Certificado::updateOrCreate(
                ['ordem' => $certificado['ordem'], 'title' => $certificado['title']],
                $certificado
            );
        }

        // Certificado "rico", vinculado à inscrição de João (com presença
        // já confirmada pelo InscricaoSeeder) — é o que o botão "Gerar
        // certificado" usa para exercitar o Template Method de verdade.
        $evento = Evento::where('title', 'Semana de Tecnologia 2026')->first();
        $joao = Aluno::where('matricula', '2023011234')->first();

        if ($evento !== null && $joao !== null) {
            $inscricao = $evento->inscricoes()->where('aluno_id', $joao->id)->first();

            if ($inscricao !== null) {
                Certificado::updateOrCreate(
                    ['codigo' => 'SEED-JOAO-EVT1'],
                    [
                        'ordem' => 3,
                        'title' => $evento->title,
                        'hours' => '12h',
                        'completed_at' => 'concluído em 12 de setembro de 2026',
                        'status' => 'assinado',
                        'inscricao_id' => $inscricao->id,
                        'emitido_por' => 'Secretaria Acadêmica',
                        'assinante' => 'Gerência de RH',
                    ]
                );
            }
        }
    }
}
