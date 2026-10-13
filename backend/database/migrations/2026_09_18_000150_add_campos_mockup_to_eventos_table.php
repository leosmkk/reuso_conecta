<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Campos do mockup (conectacampus/legacy/ConectaCampus.dc.html) que a
 * tabela eventos ainda não tinha: description/hours/category/speaker/
 * speakerArea vêm da tela de Detalhe do evento; address é o bloco "Local"
 * (gated pelo módulo geo); empresa_parceira/tipo_apoio são o bloco extra
 * da tela "Cadastrar evento" (gated pelo módulo customField).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->string('hours')->nullable();
            $table->string('category')->nullable();
            $table->string('speaker')->nullable();
            $table->string('speaker_area')->nullable();
            $table->string('address')->nullable();
            $table->string('empresa_parceira')->nullable();
            $table->string('tipo_apoio')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            $table->dropColumn([
                'description', 'hours', 'category', 'speaker',
                'speaker_area', 'address', 'empresa_parceira', 'tipo_apoio',
            ]);
        });
    }
};
