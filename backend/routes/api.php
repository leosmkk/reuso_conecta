<?php

use App\Http\Controllers\Api\AlterarController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CadastroController;
use App\Http\Controllers\Api\CertificadoController;
use App\Http\Controllers\Api\CheckInController;
use App\Http\Controllers\Api\ExcluirController;
use App\Http\Controllers\Api\InscricaoController;
use App\Http\Controllers\Api\InserirController;
use App\Http\Controllers\Api\ModuloTenantController;
use App\Http\Controllers\Api\PesquisarController;
use App\Http\Controllers\Api\PresencaController;
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

// Central de módulos (Frente 2: Tenant/Modulo) — toggle em runtime da
// variabilidade que hoje só trocava via .env + restart do container.
Route::put('/tenants/{tenantId}/modulos/{moduloChave}', [ModuloTenantController::class, 'alternar']);

// Telas dos protótipos de pontos de função: acesso por perfil e cadastros
// (EE04-EE06), inscrição e cancelamento (EE07-EE08), validação de presença
// por QR Code (EE09), relatório de participação (SE01) e certificado (SE02).
Route::post('/login', [AuthController::class, 'login']);
Route::post('/cadastro/aluno', [AuthController::class, 'cadastroAluno']);
Route::post('/centros-academicos', [CadastroController::class, 'centro']);
Route::post('/palestrantes', [CadastroController::class, 'palestrante']);

Route::post('/eventos/{eventoId}/inscricoes', [InscricaoController::class, 'inscrever']);
Route::delete('/inscricoes/{id}', [InscricaoController::class, 'cancelar']);
Route::get('/alunos/{alunoId}/inscricoes', [InscricaoController::class, 'doAluno']);

Route::post('/presencas/validar', [PresencaController::class, 'validar']);
Route::get('/eventos/{eventoId}/presencas', [PresencaController::class, 'doEvento']);

Route::get('/relatorios/participacao', [RelatorioController::class, 'participacao']);

Route::post('/inscricoes/{inscricaoId}/certificado', [CertificadoController::class, 'emitir']);
Route::put('/certificados/{id}/assinar', [CertificadoController::class, 'assinar']);
