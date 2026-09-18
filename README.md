# reuso_conecta

Porta do [ConectaCampus](../conectacampus) (Node/Azure Functions + MongoDB)
para **PHP/Laravel + PostgreSQL**, feita para o trabalho de padrões de
projeto da equipe. Os três padrões — Singleton, Template Method e
Strategy — deixam de ser demonstração isolada (ver
`conectacampus/design-patterns/`) e passam a ser **código de produção**
que atende requisições HTTP reais: `App\Patterns\*` no backend Laravel.

O frontend (as mesmas 2 telas React de agenda + certificados) é o mesmo
app, só reapontado para esta API.

## Pré-requisitos

- Docker + Docker Compose (todo o PHP roda em container — não precisa
  de PHP nem Postgres instalados na máquina)
- Node.js (o frontend roda direto no host)

## Subir o projeto

```bash
# 1. Backend (Laravel 12 / PHP 8.4 / PostgreSQL 16, tudo em Docker)
docker compose up -d --build
docker compose exec app php artisan migrate --seed

# 2. Frontend (React / Vite, direto no host)
cd frontend
cp .env.example .env   # já aponta para http://localhost:8000
npm install
npm run dev
```

Acesse `http://localhost:5173`. A API fica em `http://localhost:8000`.

Para recomeçar do zero (reseta o banco): `docker compose exec app php artisan migrate:fresh --seed`.

## Endpoints

Drop-in compatível com o contrato que o frontend já falava com o
backend Node antigo (`conectacampus/frontend/src/services/api.js`) —
só a `VITE_API_URL` muda. Sem envelope em `{"data": [...]}`, erro
sempre em `{"message": "..."}`.

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/pesquisar?tipo=eventos\|certificados&id=` | Lista (array puro) ou busca um registro |
| POST | `/api/inserir?tipo=` | Cria um registro — 201 |
| PUT | `/api/alterar/{id}?tipo=` | Atualização parcial — 200 |
| DELETE | `/api/excluir/{id}?tipo=` | Remove — 200 |
| POST | `/api/checkin` | Confirma presença (**Strategy**) — `{evento_id, ...payload}` |
| GET | `/api/certificados/{id}/documento` | Gera o certificado (**Template Method**) |
| GET | `/api/relatorios/resumo` | Totais via SQL puro (**Singleton** `ConnectionFactory`) |

## Onde cada padrão atua

Todo o código dos padrões está em `backend/app/Patterns/`.

- **Singleton** (`Patterns/Singleton/`) — `VariabilityConfig` é o ponto
  único de leitura da variabilidade da LPS (`CHECKIN_METHOD`,
  `CERTIFICADO_TEMPLATE`, `TENANT` no `.env`). `ConnectionFactory` é a
  conexão PDO única (lazy) usada por `RelatorioController` numa
  consulta em SQL puro, fora do Eloquent.
- **Template Method** (`Patterns/TemplateMethod/`) — `GeradorCertificado`
  define o esqueleto (cabeçalho → corpo → assinatura → rodapé);
  `GeradorUniversidade`/`GeradorEmpresa`/`GeradorAssociacao` variam os
  passos. `GET /api/certificados/{id}/documento` (botão **"Gerar
  certificado"** em Certificados) escolhe o gerador conforme
  `VariabilityConfig::getCertificadoTemplate()`.
- **Strategy** (`Patterns/Strategy/`) — `QrCodeCheckIn` /
  `ManualCheckIn` / `NfcCheckIn` implementam `CheckInMethod`;
  `CheckInContext` guarda a estratégia atual e permite trocá-la em
  runtime. `POST /api/checkin` (botão **"Confirmar presença"** na
  agenda) resolve a estratégia via `CheckInMethodFactory` a partir de
  `VariabilityConfig::getCheckInMethod()`.

Troque a variabilidade sem tocar em código:

```bash
# no backend/.env
CHECKIN_METHOD=nfc          # qrcode | manual | nfc
CERTIFICADO_TEMPLATE=empresa # universidade | empresa | associacao
```

depois `docker compose restart app`.

## Sobre o botão "Confirmar presença"

A tela atual não tem login nem seleção de aluno — `POST /api/checkin`
sempre opera sobre o aluno semeado `DEMO-0001`
(`database/seeders/AlunoSeeder.php`). O default local é
`CHECKIN_METHOD=manual` porque é o único método que não exige um
payload extra (token de QR Code ou id de crachá) que a UI simples não
coleta; mudar para `qrcode`/`nfc` faz o botão falhar com a mensagem
específica de cada estratégia — o que é o comportamento correto (o
método pede um dado que só existiria com o hardware real).

## Dados de exemplo

Os seeders (`backend/database/seeders/`) reproduzem
`conectacampus/mongodb-seed/*.json` (4 eventos, 2 certificados) e os 3
tenants/5 módulos descritos em `conectacampus/Prompt.md`, mais um
certificado já vinculado a uma inscrição com presença confirmada
(`CertificadoSeeder`), para o Template Method ter o que gerar assim que
o banco é semeado.

## Relação com o repo `conectacampus`

`conectacampus/` continua sendo a entrega Node/Azure Functions
publicada (e o trabalho de padrões em `conectacampus/design-patterns/`,
que é a versão didática/standalone destes mesmos 3 padrões). Este
repo é a segunda implementação, em PHP, com os padrões plugados na
aplicação de verdade.
