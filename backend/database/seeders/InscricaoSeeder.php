<?php

namespace Database\Seeders;

use App\Models\Aluno;
use App\Models\Evento;
use App\Models\Presenca;
use Illuminate\Database\Seeder;

/**
 * Inscrições de exemplo, necessárias para o botão "Confirmar presença"
 * (Strategy) e para já existir um certificado gerável (Template Method)
 * assim que o banco é semeado.
 */
class InscricaoSeeder extends Seeder
{
    public function run(): void
    {
        $eventoTecnologia = Evento::where('title', 'Semana de Tecnologia 2026')->firstOrFail();
        $eventoEtica = Evento::where('title', 'Palestra: Ética em Inteligência Artificial')->firstOrFail();

        $demo = Aluno::where('matricula', 'DEMO-0001')->firstOrFail();
        $joao = Aluno::where('matricula', '2023011234')->firstOrFail();
        $maria = Aluno::where('matricula', '2023011235')->firstOrFail();

        foreach ([[$demo, $eventoTecnologia], [$joao, $eventoTecnologia], [$maria, $eventoEtica]] as [$aluno, $evento]) {
            if ($evento->inscricoes()->where('aluno_id', $aluno->id)->exists()) {
                continue;
            }

            if (!$evento->temVaga()) {
                continue;
            }

            $evento->inscrever($aluno);
        }

        // Presença de João já confirmada no seed, para o endpoint
        // GET /api/certificados/{id}/documento ter o que renderizar
        // sem exigir passar pelo check-in primeiro.
        $inscricaoJoao = $eventoTecnologia->inscricoes()->where('aluno_id', $joao->id)->first();

        if ($inscricaoJoao !== null && !$inscricaoJoao->temPresenca()) {
            Presenca::create([
                'inscricao_id' => $inscricaoJoao->id,
                'data_hora' => '19:05',
                'metodo' => 'Manual',
                'registrado_por' => 'seed (Centro Acadêmico)',
            ]);
        }
    }
}
