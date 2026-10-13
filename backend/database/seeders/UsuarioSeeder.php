<?php

namespace Database\Seeders;

use App\Models\Aluno;
use App\Models\CentroAcademico;
use App\Models\Evento;
use App\Models\Palestrante;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Um acesso por perfil para a equipe navegar pelas telas (senha única
 * `senha123`), mais palestrantes ligados aos eventos do seed.
 */
class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $helena = Palestrante::updateOrCreate(
            ['email' => 'helena.coutinho@externo.org'],
            ['nome' => 'Dra. Helena Coutinho', 'area_atuacao' => 'Engenharia de Software']
        );
        $marco = Palestrante::updateOrCreate(
            ['email' => 'marco.teixeira@externo.org'],
            ['nome' => 'Prof. Marco Teixeira', 'area_atuacao' => 'Filosofia da tecnologia']
        );
        $priscila = Palestrante::updateOrCreate(
            ['email' => 'priscila.nunes@externo.org'],
            ['nome' => 'Eng. Priscila Nunes', 'area_atuacao' => 'Automação industrial']
        );

        Evento::where('ordem', 1)->update(['palestrante_id' => $helena->id]);
        Evento::where('ordem', 2)->update(['palestrante_id' => $marco->id]);
        Evento::where('ordem', 3)->update(['palestrante_id' => $priscila->id]);

        $centro = CentroAcademico::updateOrCreate(
            ['email' => 'ca.computacao@campus.edu'],
            [
                'nome' => 'Centro Acadêmico de Computação',
                'curso' => 'Engenharia de Software',
                'presidente' => 'Rafael Andrade Lima',
                'vice_presidente' => 'Júlia Moretti',
                'integrantes' => 'Rafael, Júlia, Otávio, Anna',
            ]
        );

        $joao = Aluno::where('matricula', '2023011234')->first();
        $maria = Aluno::where('matricula', '2023011235')->first();

        $acessos = [
            ['joao.silva@valeverde.edu', 'João da Silva', 'aluno', ['aluno_id' => $joao?->id]],
            ['maria.souza@valeverde.edu', 'Maria Souza', 'aluno', ['aluno_id' => $maria?->id]],
            ['ca.computacao@campus.edu', $centro->nome, 'centro', ['centro_academico_id' => $centro->id]],
            ['reitoria@campus.edu', 'Reitoria — Gestão institucional', 'universidade', []],
            ['helena.coutinho@externo.org', $helena->nome, 'palestrante', ['palestrante_id' => $helena->id]],
        ];

        foreach ($acessos as [$email, $nome, $perfil, $vinculo]) {
            User::updateOrCreate(
                ['email' => $email],
                array_merge(['name' => $nome, 'password' => 'senha123', 'perfil' => $perfil], $vinculo)
            );
        }
    }
}
