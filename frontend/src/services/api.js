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

// PESQUISAR — GET /api/pesquisar
export function buscarEventos() {
  return request('/api/pesquisar?tipo=eventos');
}

export function buscarCertificados() {
  return request('/api/pesquisar?tipo=certificados');
}

// INSERIR — POST /api/inserir
export function inserirEvento(dados) {
  return request('/api/inserir?tipo=eventos', { method: 'POST', body: dados });
}

// ALTERAR — PUT /api/alterar/{id}
export function alterarEvento(id, dados) {
  return request(`/api/alterar/${id}?tipo=eventos`, { method: 'PUT', body: dados });
}

// EXCLUIR — DELETE /api/excluir/{id}
export function excluirEvento(id) {
  return request(`/api/excluir/${id}?tipo=eventos`, { method: 'DELETE' });
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
