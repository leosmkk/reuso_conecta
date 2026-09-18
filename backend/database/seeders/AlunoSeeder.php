<?php

namespace Database\Seeders;

use App\Models\Aluno;
use App\Models\Cracha;
use Illuminate\Database\Seeder;

class AlunoSeeder extends Seeder
{
    public function run(): void
    {
        // Aluno fixo usado pelo botão "Confirmar presença" do frontend
        // (App\Http\Controllers\Api\CheckInController) — a tela atual
        // não tem login/seleção de aluno, então o check-in demonstra o
        // Strategy sobre esta matrícula.
        Aluno::updateOrCreate(
            ['matricula' => 'DEMO-0001'],
            [
                'nome' => 'Visitante Demonstração',
                'email' => 'demo@reuso.conecta',
                'telefone' => null,
                'curso' => 'Convidado(a)',
                'semestre' => 0,
            ]
        );

        $joao = Aluno::updateOrCreate(
            ['matricula' => '2023011234'],
            [
                'nome' => 'João da Silva',
                'email' => 'joao.silva@valeverde.edu',
                'telefone' => '(11) 90000-0001',
                'curso' => 'Engenharia de Software',
                'semestre' => 6,
            ]
        );

        $maria = Aluno::updateOrCreate(
            ['matricula' => '2023011235'],
            [
                'nome' => 'Maria Souza',
                'email' => 'maria.souza@valeverde.edu',
                'telefone' => '(11) 90000-0002',
                'curso' => 'Engenharia de Software',
                'semestre' => 4,
            ]
        );

        Cracha::updateOrCreate(['id_cracha' => 'NFC-001'], ['aluno_id' => $joao->id, 'ativo' => true]);
        Cracha::updateOrCreate(['id_cracha' => 'NFC-002'], ['aluno_id' => $maria->id, 'ativo' => true]);
    }
}
