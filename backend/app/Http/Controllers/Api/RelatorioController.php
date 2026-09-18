<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Patterns\Singleton\ConnectionFactory;
use Illuminate\Http\JsonResponse;

/**
 * GET /api/relatorios/resumo — o cenário em que ConnectionFactory se
 * justifica: uma consulta em SQL puro, fora do Eloquent, usando a
 * conexão PDO única do Singleton.
 */
class RelatorioController extends Controller
{
    public function resumo(ConnectionFactory $conexoes): JsonResponse
    {
        $pdo = $conexoes->getConnection();

        if ($pdo === null) {
            return response()->json(['message' => 'Banco indisponível: ' . $conexoes->getErro()], 503);
        }

        $totalEventos = (int) $pdo->query('SELECT COUNT(*) FROM eventos')->fetchColumn();
        $totalInscricoes = (int) $pdo->query('SELECT COUNT(*) FROM inscricoes')->fetchColumn();
        $totalPresencas = (int) $pdo->query('SELECT COUNT(*) FROM presencas')->fetchColumn();
        $vagas = $pdo->query('SELECT COALESCE(SUM(seats_used), 0) AS ocupadas, COALESCE(SUM(seats_total), 0) AS totais FROM eventos')->fetch();

        return response()->json([
            'totalEventos' => $totalEventos,
            'totalInscricoes' => $totalInscricoes,
            'totalPresencas' => $totalPresencas,
            'vagasOcupadas' => (int) $vagas['ocupadas'],
            'vagasTotais' => (int) $vagas['totais'],
        ]);
    }
}
