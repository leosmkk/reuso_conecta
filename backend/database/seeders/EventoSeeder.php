<?php

namespace Database\Seeders;

use App\Models\Evento;
use Illuminate\Database\Seeder;

/**
 * Cópia fiel de conectacampus/mongodb-seed/eventos.json (4 primeiros) +
 * os 2 eventos extras do mockup legacy (Hackathon Interunidades, Roda de
 * conversa — conectacampus/legacy/ConectaCampus.dc.html:653-659), com os
 * campos de descrição/carga/categoria/palestrante/endereço que o mockup
 * usa na tela de Detalhe do evento.
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
                'description' => 'Três dias de palestras, oficinas e mostra de projetos abertos a toda a comunidade acadêmica, com trilhas de dados, engenharia e produto.',
                'hours' => '12h',
                'category' => 'Congresso',
                'speaker' => 'Dra. Helena Coutinho',
                'speaker_area' => 'Engenharia de Software',
                'address' => 'Auditório Central — Bloco A, Campus Sede, Av. das Palmeiras 1200',
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
                'description' => 'Uma discussão sobre responsabilidade, viés algorítmico e regulação, com estudos de caso recentes.',
                'hours' => '2h',
                'category' => 'Palestra',
                'speaker' => 'Prof. Marco Teixeira',
                'speaker_area' => 'Filosofia da tecnologia',
                'address' => 'Sala B-204 — Bloco B, Campus Sede, Av. das Palmeiras 1200',
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
                'description' => 'Montagem e programação de kits de robótica aplicados ao ensino básico.',
                'hours' => '6h',
                'category' => 'Oficina',
                'speaker' => 'Eng. Priscila Nunes',
                'speaker_area' => 'Automação industrial',
                'address' => 'Laboratório de Automação — Bloco D, Campus Norte',
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
                'description' => 'Apresentação dos projetos de iniciação científica do semestre com avaliação por banca.',
                'hours' => '8h',
                'category' => 'Mostra',
                'speaker' => 'Comitê científico',
                'speaker_area' => 'Multidisciplinar',
                'address' => 'Pavilhão Norte — Campus Norte, Rua dos Ipês 45',
            ],
            [
                'ordem' => 5,
                'title' => 'Hackathon Interunidades',
                'org' => 'Centro Acadêmico de Computação',
                'date_label' => '9 de outubro',
                'hora' => '18:00',
                'place' => 'Bloco D — Coworking',
                'status' => 'inscrito',
                'seats_used' => 96,
                'seats_total' => 120,
                'description' => '36 horas de desenvolvimento em times mistos sobre desafios reais das unidades da instituição.',
                'hours' => '30h',
                'category' => 'Competição',
                'speaker' => 'Mentoria convidada',
                'speaker_area' => 'Produto e tecnologia',
                'address' => 'Coworking acadêmico — Bloco D, Campus Sede',
            ],
            [
                'ordem' => 6,
                'title' => 'Roda de conversa: Carreira e mercado',
                'org' => 'Centro Acadêmico de Administração',
                'date_label' => '15 de outubro',
                'hora' => '16:00',
                'place' => 'Biblioteca Central',
                'status' => 'vagas',
                'seats_used' => 18,
                'seats_total' => 45,
                'description' => 'Conversa aberta com egressos sobre transição da graduação para o mercado.',
                'hours' => '2h',
                'category' => 'Roda de conversa',
                'speaker' => 'Egressos convidados',
                'speaker_area' => 'Gestão e negócios',
                'address' => 'Biblioteca Central — Térreo, Campus Sede',
            ],
        ];

        // Data real, término e coordenadas (Curitiba) de cada evento — base
        // do cancelamento (evento já realizado), do relatório por período
        // e do mapa do módulo geo.
        $detalhes = [
            1 => ['data' => '2026-09-12', 'hora_fim' => '22:00', 'latitude' => -25.4519, 'longitude' => -49.2578],
            2 => ['data' => '2026-09-18', 'hora_fim' => '16:30', 'latitude' => -25.4519, 'longitude' => -49.2578],
            3 => ['data' => '2026-09-24', 'hora_fim' => '15:00', 'latitude' => -25.4350, 'longitude' => -49.2760],
            4 => ['data' => '2026-10-02', 'hora_fim' => '18:00', 'latitude' => -25.4350, 'longitude' => -49.2760],
            5 => ['data' => '2026-10-09', 'hora_fim' => '23:59', 'latitude' => -25.4519, 'longitude' => -49.2578],
            6 => ['data' => '2026-10-15', 'hora_fim' => '18:00', 'latitude' => -25.4488, 'longitude' => -49.2601],
        ];

        foreach ($eventos as $evento) {
            $evento = array_merge($evento, $detalhes[$evento['ordem']] ?? []);
            Evento::updateOrCreate(['ordem' => $evento['ordem'], 'title' => $evento['title']], $evento);
        }
    }
}
