import { useState } from 'react';
import { buscarParticipacao } from '../../services/api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { useOpcoes } from '../../hooks/useOpcoes.js';
import { ErrorMessage, WarningMessage } from '../../components/Feedback.jsx';
import { Campo, Card, PrimaryButton, StatusBadge, inputStyle } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';
import { formatarData } from '../certificados/dadosCertificado.js';

const STATUS = {
  realizado: [cores.verdeMarca, 'rgba(15,138,107,.1)', 'Realizado'],
  aberto: [cores.textoTerciario, 'rgba(74,72,87,.08)', 'Aberto']
};

const porcentagem = (valor) => (valor == null ? '—' : `${String(valor).replace('.', ',')}%`);

// SE01 / RF30-RF34 — relatório de participação por evento. Período vale
// para todos; status e aluno são os filtros avançados do módulo advReports.
export default function RelatorioParticipacao() {
  const { corPrimaria: brand, modulosAtivos } = useTenant();
  const temAdvReports = modulosAtivos.includes('advReports');
  const alunos = useOpcoes('alunos', (a) => a.nome);
  const [filtros, setFiltros] = useState({ inicio: '', fim: '', status: '', aluno_id: '' });
  const [linhas, setLinhas] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');

  function set(campo, valor) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }));
  }

  async function gerar() {
    try {
      setGerando(true);
      setErro('');
      setLinhas(await buscarParticipacao(filtros));
    } catch (err) {
      console.error(err);
      setErro('Não foi possível gerar o relatório.');
    } finally {
      setGerando(false);
    }
  }

  return (
    <Card style={{ marginBottom: 18 }}>
      <h3 style={{ fontFamily: fonteTitulo, fontWeight: 700, fontSize: 17, letterSpacing: '-.02em', margin: '0 0 6px' }}>
        Relatório de participação
      </h3>
      <p style={{ color: cores.textoSecundario, fontSize: 13.5, margin: '0 0 18px' }}>
        Totais e percentuais calculados a partir dos eventos e inscrições (RF30–RF34).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${temAdvReports ? 4 : 2}, 1fr) auto`, gap: 14, alignItems: 'end' }}>
        <Campo label="Data inicial">
          <input type="date" value={filtros.inicio} onChange={(e) => set('inicio', e.target.value)} style={inputStyle} />
        </Campo>
        <Campo label="Data final">
          <input type="date" value={filtros.fim} onChange={(e) => set('fim', e.target.value)} style={inputStyle} />
        </Campo>
        {temAdvReports && (
          <>
            <Campo label="Usuário">
              <select value={filtros.aluno_id} onChange={(e) => set('aluno_id', e.target.value)} style={inputStyle}>
                <option value="">Todos</option>
                {alunos.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Status do evento">
              <select value={filtros.status} onChange={(e) => set('status', e.target.value)} style={inputStyle}>
                <option value="">Todos</option>
                <option value="realizado">Realizado</option>
                <option value="aberto">Aberto</option>
              </select>
            </Campo>
          </>
        )}
        <PrimaryButton brand={brand} onClick={gerar} disabled={gerando}>
          {gerando ? 'Gerando...' : 'Gerar relatório'}
        </PrimaryButton>
      </div>

      {erro && (
        <div style={{ marginTop: 18 }}>
          <ErrorMessage message={erro} />
        </div>
      )}

      {linhas && linhas.length === 0 && (
        <div style={{ marginTop: 18 }}>
          <WarningMessage message="Nenhum evento encontrado no período informado." />
        </div>
      )}

      {linhas && linhas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 22 }}>
          <thead>
            <tr>
              {['Evento', 'Data', 'Status', 'Inscritos', 'Presentes', 'Taxa de presença', 'Ocupação'].map((titulo) => (
                <th key={titulo} style={thStyle}>
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.eventoId} style={{ borderTop: `1px solid ${cores.divisor}` }}>
                <td style={tdStyle}>
                  <b>{linha.titulo}</b>
                </td>
                <td style={tdStyle}>{formatarData(linha.data) || linha.dataLabel}</td>
                <td style={tdStyle}>
                  <StatusBadge status={linha.status} mapa={STATUS} />
                </td>
                <td style={tdStyle}>{linha.inscritos}</td>
                <td style={tdStyle}>{linha.presentes ?? '—'}</td>
                <td style={tdStyle}>
                  <b>{porcentagem(linha.taxaPresenca)}</b>
                </td>
                <td style={tdStyle}>{porcentagem(linha.ocupacao)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '10px 12px',
  font: '700 11px Inter, sans-serif',
  color: cores.eyebrow,
  textTransform: 'uppercase',
  letterSpacing: '.05em'
};

const tdStyle = {
  padding: '12px',
  fontSize: 13,
  color: cores.textoTerciario
};
