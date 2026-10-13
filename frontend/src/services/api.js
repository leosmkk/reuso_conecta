const API_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = 'GET', body } = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL não configurada.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  const texto = await response.text();
  let dados = null;

  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!response.ok) {
    const mensagem =
      (dados && dados.message) || `Erro HTTP ${response.status}`;
    throw new Error(mensagem);
  }

  return dados;
}

// PESQUISAR — GET /api/pesquisar?tipo=&id=. Genérico: usado pelas 8 telas
// CRUD (eventos, certificados, alunos, inscricoes, presencas, crachas,
// tenants, modulos — ver App\Support\TipoResolver::MAPA no backend).
export function pesquisar(tipo, id) {
  const query = id ? `?tipo=${tipo}&id=${id}` : `?tipo=${tipo}`;
  return request(`/api/pesquisar${query}`);
}

// INSERIR — POST /api/inserir?tipo=
export function inserir(tipo, dados) {
  return request(`/api/inserir?tipo=${tipo}`, { method: 'POST', body: dados });
}

// ALTERAR — PUT /api/alterar/{id}?tipo=
export function alterar(tipo, id, dados) {
  return request(`/api/alterar/${id}?tipo=${tipo}`, { method: 'PUT', body: dados });
}

// EXCLUIR — DELETE /api/excluir/{id}?tipo=
export function excluir(tipo, id) {
  return request(`/api/excluir/${id}?tipo=${tipo}`, { method: 'DELETE' });
}

// Wrappers finos mantidos pelo nome antigo — AgendaPage.jsx e
// CertificatesPage.jsx (e o contrato documentado no README) já os chamam
// assim.
export function buscarEventos() {
  return pesquisar('eventos');
}

export function buscarCertificados() {
  return pesquisar('certificados');
}

export function inserirEvento(dados) {
  return inserir('eventos', dados);
}

export function alterarEvento(id, dados) {
  return alterar('eventos', id, dados);
}

export function excluirEvento(id) {
  return excluir('eventos', id);
}

// CHECKIN — POST /api/checkin (Strategy: App\Patterns\Strategy\CheckInContext)
export function confirmarPresenca(eventoId, payload = {}) {
  return request('/api/checkin', {
    method: 'POST',
    body: { evento_id: eventoId, ...payload }
  });
}

// DOCUMENTO — GET /api/certificados/{id}/documento (Template Method:
// App\Patterns\TemplateMethod\GeradorCertificado)
export function gerarDocumentoCertificado(id) {
  return request(`/api/certificados/${id}/documento`);
}

// TENANT ATIVO — GET /api/tenant-ativo (variabilidade de marca por
// tenant: App\Patterns\Singleton\VariabilityConfig + App\Models\Tenant)
export function buscarTenantAtivo() {
  return request('/api/tenant-ativo');
}

// RELATORIOS — GET /api/relatorios/resumo (Singleton ConnectionFactory,
// SQL puro; inscricoesPorCurso/eventosPorStatus só vêm com o módulo advReports)
export function buscarResumoRelatorios() {
  return request('/api/relatorios/resumo');
}

// MÓDULO POR TENANT — PUT /api/tenants/{tenantId}/modulos/{chave}. É o
// switch da Central de Módulos: liga/desliga a variabilidade da LPS em
// runtime, sem trocar .env nem reiniciar o container.
export function alternarModulo(tenantId, chave, ativo) {
  return request(`/api/tenants/${tenantId}/modulos/${chave}`, {
    method: 'PUT',
    body: { ativo }
  });
}
