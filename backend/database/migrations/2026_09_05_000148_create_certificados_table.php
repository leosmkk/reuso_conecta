<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('certificados', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('ordem')->default(0);
            $table->string('title');
            $table->string('hours')->nullable();
            $table->string('completed_at')->nullable();
            $table->string('status')->default('disponivel');
            // Campos opcionais usados só quando o certificado está de fato
            // vinculado a uma inscrição (endpoint /documento — Template Method).
            $table->foreignId('inscricao_id')->nullable()->constrained(table: 'inscricoes')->nullOnDelete();
            $table->string('codigo')->nullable()->unique();
            $table->string('emitido_por')->nullable();
            $table->string('assinante')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificados');
    }
};
