<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Patterns\Singleton\ConnectionFactory;
use App\Support\ModuloGuard;
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

        $resumo = [
            'totalEventos' => $totalEventos,
            'totalInscricoes' => $totalInscricoes,
            'totalPresencas' => $totalPresencas,
            'vagasOcupadas' => (int) $vagas['ocupadas'],
            'vagasTotais' => (int) $vagas['totais'],
        ];

        // Módulo advReports (ConectaCampus.dc.html:446-452, filtros
        // avançados de relatório): recorte extra só entra quando o tenant
        // ativo contratou o módulo.
        if (ModuloGuard::possui('advReports')) {
            $porCurso = $pdo->query(
                'SELECT COALESCE(a.curso, \'Não informado\') AS curso, COUNT(*) AS total
                 FROM inscricoes i JOIN alunos a ON a.id = i.aluno_id
                 GROUP BY a.curso ORDER BY total DESC'
            )->fetchAll();

            $porStatusEvento = $pdo->query(
                'SELECT status, COUNT(*) AS total FROM eventos GROUP BY status ORDER BY total DESC'
            )->fetchAll();

            $resumo['inscricoesPorCurso'] = array_map(
                fn ($linha) => ['curso' => $linha['curso'], 'total' => (int) $linha['total']],
                $porCurso
            );
            $resumo['eventosPorStatus'] = array_map(
                fn ($linha) => ['status' => $linha['status'], 'total' => (int) $linha['total']],
                $porStatusEvento
            );
        }

        return response()->json($resumo);
    }
}
