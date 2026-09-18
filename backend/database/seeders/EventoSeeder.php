<?php

namespace Database\Seeders;

use App\Models\Evento;
use Illuminate\Database\Seeder;

/**
 * Cópia fiel de conectacampus/mongodb-seed/eventos.json, para o
 * GET /api/pesquisar?tipo=eventos devolver os mesmos 4 eventos que a
 * versão Node/MongoDB já mostrava.
 */
class EventoSeeder extends Seeder
{
    public function run(): void
    {
        $eventos = [
            [
                'ordem' => 1,
                'title' => 'Semana de Tecnologia 2026',
                'org' => 'Centro Acadêmico de Computação',
                'date_label' => '12 de setembro',
                'hora' => '19:00',
                'place' => 'Auditório Central',
                'status' => 'inscrito',
                'seats_used' => 148,
                'seats_total' => 240,
            ],
            [
                'ordem' => 2,
                'title' => 'Palestra: Ética em Inteligência Artificial',
                'org' => 'Centro Acadêmico de Filosofia',
                'date_label' => '18 de setembro',
                'hora' => '14:30',
                'place' => 'Sala B-204',
                'status' => 'vagas',
                'seats_used' => 34,
                'seats_total' => 60,
            ],
            [
                'ordem' => 3,
                'title' => 'Workshop de Robótica Educacional',
                'org' => 'Centro Acadêmico de Engenharia',
                'date_label' => '24 de setembro',
                'hora' => '09:00',
                'place' => 'Lab de Automação',
                'status' => 'lotado',
                'seats_used' => 40,
                'seats_total' => 40,
            ],
            [
                'ordem' => 4,
                'title' => 'Feira de Iniciação Científica',
                'org' => 'Pró-reitoria de Pesquisa',
                'date_label' => '2 de outubro',
                'hora' => '10:00',
                'place' => 'Pavilhão Norte',
                'status' => 'vagas',
                'seats_used' => 210,
                'seats_total' => 500,
            ],
        ];

        foreach ($eventos as $evento) {
            Evento::updateOrCreate(['ordem' => $evento['ordem'], 'title' => $evento['title']], $evento);
        }
    }
}
