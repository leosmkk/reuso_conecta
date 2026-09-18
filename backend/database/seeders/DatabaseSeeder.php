<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Dados reproduzíveis a partir de conectacampus/mongodb-seed/*.json
     * (eventos e certificados) e de conectacampus/Prompt.md (tenants e
     * módulos), para toda a equipe rodar `docker compose exec app php
     * artisan migrate --seed` e ver o mesmo estado.
     */
    public function run(): void
    {
        $this->call([
            ModuloSeeder::class,
            TenantSeeder::class,
            AlunoSeeder::class,
            EventoSeeder::class,
            InscricaoSeeder::class,
            CertificadoSeeder::class,
        ]);
    }
}
