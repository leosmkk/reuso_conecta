import { useEffect, useState } from 'react';
import { pesquisar, buscarResumoRelatorios } from '../../services/api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { Loading, ErrorMessage } from '../../components/Feedback.jsx';
import { Card, StatusBadge } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

const MESES = {
  janeiro: 'jan', fevereiro: 'fev', março: 'mar', abril: 'abr', maio: 'mai', junho: 'jun',
  julho: 'jul', agosto: 'ago', setembro: 'set', outubro: 'out', novembro: 'nov', dezembro: 'dez'
};

// "12 de setembro" -> { day: '12', month: 'set' }. dateLabel não tem ano
// nem é uma data estruturada (ver CLAUDE.md sobre as colunas de Evento) —
// os blocos de calendário do mockup (day/month) são só recorte de texto.
function diaMes(dateLabel) {
  const match = /(\d+)\s+de\s+(\w+)/i.exec(dateLabel || '');
  if (!match) return { day: '—', month: '' };
  const mes = MESES[match[2].toLowerCase()] || match[2].slice(0, 3);
  return { day: match[1].padStart(2, '0'), month: mes };
}

// Porta de ConectaCampus.dc.html:151-210 (Home do aluno) — banner com a
// cor do tenant, KPIs vindos de /api/relatorios/resumo (Singleton
// ConnectionFactory) e os 3 próximos eventos.
export default function InicioPage({ onAbrirDetalhe, onIrParaAgenda }) {
  const { nome, corPrimaria: brand } = useTenant();
  const [resumo, setResumo] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        setLoading(true);
        setError('');
        const [resumoDados, eventosDados] = await Promise.all([
          buscarResumoRelatorios(),
          pesquisar('eventos')
        ]);
        if (!cancelado) {
          setResumo(resumoDados);
          setEventos(eventosDados.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
        if (!cancelado) setError('Não foi possível carregar o início.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, []);

  if (loading) return <Loading>Carregando início...</Loading>;
  if (error) return <ErrorMessage message={error} />;

  const stats = resumo
    ? [
        { label: 'Eventos cadastrados', value: String(resumo.totalEventos), hint: `${resumo.totalInscricoes} inscrições no total` },
        { label: 'Presenças confirmadas', value: String(resumo.totalPresencas), hint: 'de todas as inscrições' },
        { label: 'Vagas ocupadas', value: `${resumo.vagasOcupadas}/${resumo.vagasTotais}`, hint: 'em todos os eventos' }
      ]
    : [];

  return (
    <div>
      <div style={{ font: '600 12px Inter, sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', color: cores.eyebrow, marginBottom: 8 }}>
        Início
      </div>
      <h1 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 34, letterSpacing: '-.03em', margin: '0 0 22px' }}>
        Bem-vindo(a) de volta
      </h1>

      <div
        style={{
          borderRadius: 20,
          padding: '30px 32px',
          background: brand,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 28,
          marginBottom: 22,
          boxShadow: `0 14px 34px ${brand}33`
        }}
      >
        <div style={{ maxWidth: '34em' }}>
          <div style={{ font: '700 13px Inter, sans-serif', letterSpacing: '.02em', opacity: 0.9, marginBottom: 10 }}>{nome}</div>
          <h2 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 25, lineHeight: 1.15, letterSpacing: '-.025em', margin: '0 0 10px' }}>
            Confira a agenda de eventos do campus
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.55, opacity: 0.88, margin: 0 }}>
            Inscreva-se, confirme presença e gere seus certificados em um só lugar.
          </p>
        </div>
        {onIrParaAgenda && (
          <button
            onClick={onIrParaAgenda}
            style={{ flex: 'none', height: 46, padding: '0 24px', border: 'none', borderRadius: 13, background: '#fff', color: brand, font: '700 14px Inter, sans-serif', cursor: 'pointer' }}
          >
            Ver agenda
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 22 }}>
        {stats.map((s) => (
          <Card key={s.label}>
            <div style={{ font: '600 12px Inter, sans-serif', color: cores.eyebrow, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 32, letterSpacing: '-.03em', color: brand }}>{s.value}</div>
            <div style={{ fontSize: 13, color: cores.textoSecundario, marginTop: 6 }}>{s.hint}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontFamily: fonteTitulo, fontWeight: 700, fontSize: 18, letterSpacing: '-.02em', margin: 0 }}>Próximos eventos</h3>
          {onIrParaAgenda && (
            <button onClick={onIrParaAgenda} style={{ border: 'none', background: 'none', color: brand, font: '600 13.5px Inter, sans-serif', cursor: 'pointer', padding: 0 }}>
              Ver agenda completa
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {eventos.map((evento) => {
            const { day, month } = diaMes(evento.dateLabel);
            return (
              <div
                key={evento._id}
                onClick={() => onAbrirDetalhe?.(evento._id)}
                style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '15px 4px', borderTop: `1px solid ${cores.divisor}`, cursor: 'pointer' }}
              >
                <div style={{ width: 52, flex: 'none', textAlign: 'center' }}>
                  <div style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 21, lineHeight: 1, color: cores.texto }}>{day}</div>
                  <div style={{ font: '600 11px Inter, sans-serif', color: cores.eyebrow, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 3 }}>
                    {month}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 15px Inter, sans-serif', marginBottom: 4 }}>{evento.title}</div>
                  <div style={{ fontSize: 13, color: cores.textoSecundario }}>
                    {evento.time} · {evento.place}
                  </div>
                </div>
                <StatusBadge status={evento.status} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
