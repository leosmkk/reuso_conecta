<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Telas dos protótipos de pontos de função (EE04-EE06, CE02): login por
 * perfil, centros acadêmicos, palestrantes e os campos de data, horário
 * de término e coordenadas que o evento ainda não tinha.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('centros_academicos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('curso')->nullable();
            $table->string('email')->unique();
            $table->string('presidente')->nullable();
            $table->string('vice_presidente')->nullable();
            $table->text('integrantes')->nullable();
            $table->timestamps();
        });

        Schema::create('palestrantes', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('email')->unique();
            $table->string('area_atuacao')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('perfil')->default('aluno');
            $table->foreignId('aluno_id')->nullable()->constrained('alunos')->nullOnDelete();
            $table->foreignId('centro_academico_id')->nullable()->constrained('centros_academicos')->nullOnDelete();
            $table->foreignId('palestrante_id')->nullable()->constrained('palestrantes')->nullOnDelete();
        });

        Schema::table('eventos', function (Blueprint $table) {
            $table->date('data')->nullable();
            $table->string('hora_fim')->nullable();
            $table->foreignId('palestrante_id')->nullable()->constrained('palestrantes')->nullOnDelete();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('palestrante_id');
            $table->dropColumn(['data', 'hora_fim', 'latitude', 'longitude']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('palestrante_id');
            $table->dropConstrainedForeignId('centro_academico_id');
            $table->dropConstrainedForeignId('aluno_id');
            $table->dropColumn('perfil');
        });

        Schema::dropIfExists('palestrantes');
        Schema::dropIfExists('centros_academicos');
    }
};
