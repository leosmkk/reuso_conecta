<?php

use App\Http\Controllers\Api\AlterarController;
use App\Http\Controllers\Api\CertificadoController;
use App\Http\Controllers\Api\CheckInController;
use App\Http\Controllers\Api\ExcluirController;
use App\Http\Controllers\Api\InserirController;
use App\Http\Controllers\Api\PesquisarController;
use App\Http\Controllers\Api\RelatorioController;
use App\Http\Controllers\Api\TenantController;
use Illuminate\Support\Facades\Route;

// Drop-in compatível com o contrato do backend Node antigo
// (azure-function/src/functions/*.js) — ver conectacampus/frontend/src/
// services/api.js. tipo=eventos|certificados, id inteiro (não ObjectId).
Route::get('/pesquisar', PesquisarController::class);
Route::post('/inserir', InserirController::class);
Route::put('/alterar/{id}', AlterarController::class);
Route::delete('/excluir/{id}', ExcluirController::class);

// Endpoints novos — os padrões de projeto operando como código de
// produção (Strategy e Template Method).
Route::post('/checkin', CheckInController::class);
Route::get('/certificados/{id}/documento', [CertificadoController::class, 'documento']);

Route::get('/relatorios/resumo', [RelatorioController::class, 'resumo']);
Route::get('/tenant-ativo', [TenantController::class, 'ativo']);
