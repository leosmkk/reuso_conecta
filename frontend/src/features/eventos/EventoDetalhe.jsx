import { useEffect, useState } from 'react';
import { pesquisar } from '../../services/api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { Loading, ErrorMessage } from '../../components/Feedback.jsx';
import { Card, StatusBadge, GhostButton } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

// Porta de ConectaCampus.dc.html:253-309 — fora do menu, alcançada por
// clique num card da Agenda ou do Início (goEvento). O mapa mock é gated
// pelo módulo geo, igual ao mockup (linha 275).
export default function EventoDetalhe({ eventoId, onVoltar }) {
  const { corPrimaria: brand, modulosAtivos } = useTenant();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const temGeo = modulosAtivos.includes('geo');

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        setLoading(true);
        setError('');
        const dados = await pesquisar('eventos', eventoId);
        if (!cancelado) setEvento(dados);
      } catch (err) {
        console.error(err);
        if (!cancelado) setError('Não foi possível carregar o evento.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [eventoId]);

  if (loading) return <Loading>Carregando evento...</Loading>;
  if (error) return <ErrorMessage message={error} />;
  if (!evento) return null;

  const vagasRestantes = evento.seatsTotal - evento.seatsUsed;
  const seats = evento.status === 'lotado' ? 'Lista de espera' : `${vagasRestantes} vagas restantes`;
  const pct = evento.seatsTotal ? Math.round((evento.seatsUsed / evento.seatsTotal) * 100) : 0;
  const cta = evento.status === 'inscrito' ? 'Cancelar inscrição' : evento.status === 'lotado' ? 'Entrar na lista de espera' : 'Confirmar inscrição';

  return (
    <div>
      <button
        onClick={onVoltar}
        style={{
          border: 'none',
          background: 'none',
          color: brand,
          fontWeight: 600,
          fontSize: 13.5,
          padding: 0,
          marginBottom: 18,
          cursor: 'pointer'
        }}
      >
        ← Voltar para a agenda
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <StatusBadge status={evento.status} />
            <span style={{ fontSize: 13, color: cores.textoSecundario, fontWeight: 600 }}>{evento.category}</span>
          </div>

          <h1 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 30, letterSpacing: '-.03em', margin: '0 0 16px' }}>
            {evento.title}
          </h1>

          <p style={{ fontSize: 14.5, color: cores.textoTerciario, lineHeight: 1.6, margin: '0 0 22px' }}>
            {evento.description || 'Sem descrição cadastrada.'}
          </p>

          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginBottom: 22 }}>
            <Metrica label="Data" valor={evento.dateLabel} />
            <Metrica label="Horário" valor={evento.time} />
            <Metrica label="Carga horária" valor={evento.hours} />
          </div>

          {temGeo && (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px 0' }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Local</div>
                <div style={{ fontSize: 13.5, color: cores.textoSecundario, marginBottom: 16 }}>
                  {evento.address || evento.place}
                </div>
              </div>
              <div
                style={{
                  height: 220,
                  background: 'repeating-linear-gradient(45deg,#EBE9F5,#EBE9F5 9px,#F5F4FB 9px,#F5F4FB 18px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(transparent 49.5%,rgba(139,136,160,.22) 50%,transparent 50.5%),linear-gradient(90deg,transparent 49.5%,rgba(139,136,160,.22) 50%,transparent 50.5%)',
                    backgroundSize: '60px 60px'
                  }}
                />
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50% 50% 50% 4px', transform: 'rotate(-45deg)', background: brand, boxShadow: '0 6px 18px rgba(27,26,35,.22)' }} />
                  <div style={{ font: '500 11.5px ui-monospace,Menlo,monospace', color: '#5A5770', background: 'rgba(255,255,255,.85)', padding: '5px 10px', borderRadius: 8 }}>
                    mapa · embed Google Maps
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Vagas</div>
            <div style={{ fontSize: 13.5, color: brand, fontWeight: 600, marginBottom: 10 }}>{seats}</div>
            <div style={{ height: 8, borderRadius: 99, background: cores.divisor, overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: brand, borderRadius: 99 }} />
            </div>
            <GhostButton style={{ width: '100%', height: 44, fontSize: 13.5 }}>{cta}</GhostButton>
          </Card>

          <Card>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Organização</div>
            <div style={{ fontSize: 13.5, color: cores.textoSecundario, marginBottom: 18 }}>{evento.org}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Palestrante</div>
            <div style={{ fontSize: 13.5, color: cores.textoSecundario }}>
              {evento.speaker}
              {evento.speakerArea && ` · ${evento.speakerArea}`}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metrica({ label, valor }) {
  return (
    <div>
      <div style={{ font: '600 11px Inter, sans-serif', color: cores.eyebrow, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: cores.texto }}>{valor || '—'}</div>
    </div>
  );
}
