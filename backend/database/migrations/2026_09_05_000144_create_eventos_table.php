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
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('ordem')->default(0);
            $table->string('title');
            $table->string('org')->nullable();
            $table->string('date_label')->nullable();
            $table->string('hora')->nullable();
            $table->string('place')->nullable();
            $table->string('status')->default('vagas');
            $table->unsignedInteger('seats_used')->default(0);
            $table->unsignedInteger('seats_total')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};
