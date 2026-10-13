import { useEffect, useState } from 'react';
import { buscarResumoRelatorios } from '../../services/api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { Loading, ErrorMessage } from '../../components/Feedback.jsx';
import { PageHeader, Card } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

// Porta de ConectaCampus.dc.html:438-487 (Relatórios gerenciais). Os 3
// selects avançados (linhas 446-452) só aparecem com o módulo advReports
// — que é também quando o backend inclui inscricoesPorCurso/
// eventosPorStatus na resposta de /api/relatorios/resumo.
export default function RelatoriosPage() {
  const { corPrimaria: brand, modulosAtivos } = useTenant();
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const temAdvReports = modulosAtivos.includes('advReports');

  useEffect(() => {
    let cancelado = false;

    buscarResumoRelatorios()
      .then((dados) => !cancelado && setResumo(dados))
      .catch((err) => {
        console.error(err);
        if (!cancelado) setError('Não foi possível carregar os relatórios.');
      })
      .finally(() => !cancelado && setLoading(false));

    return () => {
      cancelado = true;
    };
  }, []);

  if (loading) return <Loading>Carregando relatórios...</Loading>;
  if (error) return <ErrorMessage message={error} />;
  if (!resumo) return null;

  const maxCurso = Math.max(1, ...(resumo.inscricoesPorCurso || []).map((c) => c.total));
  const maxStatus = Math.max(1, ...(resumo.eventosPorStatus || []).map((s) => s.total));

  return (
    <div>
      <PageHeader eyebrow="Relatórios" title="Relatórios gerenciais" />

      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <Resumo label="Total de eventos" valor={resumo.totalEventos} />
          <Resumo label="Total de inscrições" valor={resumo.totalInscricoes} />
          <Resumo label="Total de presenças" valor={resumo.totalPresencas} />
          <Resumo label="Vagas ocupadas / totais" valor={`${resumo.vagasOcupadas} / ${resumo.vagasTotais}`} />
        </div>
      </Card>

      {!temAdvReports && (
        <Card>
          <div style={{ color: cores.textoSecundario, fontSize: 14 }}>
            Filtros avançados (por curso, status do evento e tipo de usuário) fazem parte do
            módulo <strong>Relatórios avançados</strong>, não contratado por este tenant.
          </div>
        </Card>
      )}

      {temAdvReports && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
          <Card>
            <h3 style={{ fontFamily: fonteTitulo, fontWeight: 700, fontSize: 17, letterSpacing: '-.02em', margin: '0 0 20px' }}>
              Eventos por status
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160 }}>
              {(resumo.eventosPorStatus || []).map((s) => (
                <div key={s.status} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ font: '700 12px Inter, sans-serif', color: cores.textoTerciario }}>{s.total}</div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 56,
                      height: Math.round((s.total / maxStatus) * 110),
                      borderRadius: '10px 10px 4px 4px',
                      background: brand,
                      opacity: 0.55 + (s.total / maxStatus) * 0.45
                    }}
                  />
                  <div style={{ font: '600 11.5px Inter, sans-serif', color: cores.eyebrow, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {s.status}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 style={{ fontFamily: fonteTitulo, fontWeight: 700, fontSize: 17, letterSpacing: '-.02em', margin: '0 0 20px' }}>
              Inscrições por curso
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(resumo.inscricoesPorCurso || []).map((c) => (
                <div key={c.curso} style={{ padding: '13px 0', borderTop: `1px solid ${cores.divisor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div style={{ font: '600 13.5px Inter, sans-serif' }}>{c.curso}</div>
                    <div style={{ font: '700 13px Inter, sans-serif', color: brand }}>{c.total}</div>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: cores.divisor, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c.total / maxCurso) * 100}%`, background: brand, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Resumo({ label, valor }) {
  return (
    <div style={{ minWidth: 150 }}>
      <div style={{ font: '600 11.5px Inter, sans-serif', color: cores.eyebrow, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 22 }}>{valor}</div>
    </div>
  );
}
