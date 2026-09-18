<?php

namespace App\Patterns\Singleton;

use PDO;
use PDOException;

/**
 * SINGLETON — produção.
 *
 * Fábrica de uma única conexão PDO "crua", independente do pool de
 * conexões do Eloquent, usada por App\Http\Controllers\Api\
 * RelatorioController para uma consulta em SQL puro (o cenário típico
 * em que se justifica não passar pelo ORM). A conexão é lazy — só é
 * aberta na primeira chamada a getConnection() — e os parâmetros vêm
 * da própria config('database') do Laravel, então não há credencial
 * duplicada em nenhum lugar.
 */
class ConnectionFactory
{
    private static ?ConnectionFactory $instance = null;

    private ?PDO $pdo = null;

    private ?string $erro = null;

    private bool $tentouConectar = false;

    private function __construct()
    {
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function getConnection(): ?PDO
    {
        if (!$this->tentouConectar) {
            $this->conectar();
        }

        return $this->pdo;
    }

    public function estaConectado(): bool
    {
        return $this->pdo !== null;
    }

    public function getErro(): ?string
    {
        return $this->erro;
    }

    public function getDsn(): string
    {
        $config = config('database.connections.pgsql');

        return sprintf('pgsql:host=%s;port=%s;dbname=%s', $config['host'], $config['port'], $config['database']);
    }

    private function conectar(): void
    {
        $this->tentouConectar = true;
        $config = config('database.connections.pgsql');

        try {
            $this->pdo = new PDO($this->getDsn(), $config['username'], $config['password']);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            $this->pdo = null;
            $this->erro = $e->getMessage();
        }
    }

    private function __clone()
    {
    }

    public function __wakeup()
    {
        throw new \Exception('Não é permitido desserializar um Singleton.');
    }
}
