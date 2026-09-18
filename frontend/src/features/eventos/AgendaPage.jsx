import { useEffect, useMemo, useState } from 'react';
import {
  buscarEventos,
  inserirEvento,
  alterarEvento,
  excluirEvento,
  confirmarPresenca
} from '../../services/api.js';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback.jsx';
import EventoForm from './EventoForm.jsx';

export default function AgendaPage() {
  const [eventos, setEventos] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmarId, setConfirmarId] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);
  const [presencaId, setPresencaId] = useState(null);

  async function carregar() {
    try {
      setLoading(true);
      setError('');
      const data = await buscarEventos();
      setEventos(data);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os eventos pela API.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function notificar(texto) {
    setAviso(texto);
    setTimeout(() => setAviso(''), 4000);
  }

  function abrirNovo() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  function abrirEdicao(evento) {
    setEmEdicao(evento);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setEmEdicao(null);
  }

  async function salvar(dados) {
    try {
      setSalvando(true);
      setError('');

      if (emEdicao) {
        await alterarEvento(emEdicao._id, dados);
        notificar('Evento alterado com sucesso.');
      } else {
        await inserirEvento(dados);
        notificar('Evento inserido com sucesso.');
      }

      fecharForm();
      await carregar();
    } catch (err) {
      console.error(err);
      setError(`Não foi possível salvar o evento: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id) {
    try {
      setExcluindoId(id);
      setError('');
      await excluirEvento(id);
      setConfirmarId(null);
      notificar('Evento excluído com sucesso.');
      await carregar();
    } catch (err) {
      console.error(err);
      setError(`Não foi possível excluir o evento: ${err.message}`);
    } finally {
      setExcluindoId(null);
    }
  }

  async function confirmarPresencaEvento(id) {
    try {
      setPresencaId(id);
      setError('');
      const resultado = await confirmarPresenca(id, { confirmado_por: 'Painel da Agenda' });
      notificar(resultado.message);
    } catch (err) {
      console.error(err);
      setError(`Não foi possível confirmar presença: ${err.message}`);
    } finally {
      setPresencaId(null);
    }
  }

  const filtered = useMemo(() => {
    const statusMap = {
      'Inscrito': 'inscrito',
      'Vagas abertas': 'vagas',
      'Lotados': 'lotado'
    };

    return eventos.filter((evento) => {
      const matchesStatus =
        filter === 'Todos' || evento.status === statusMap[filter];

      const matchesSearch =
        evento.title?.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [eventos, filter, search]);

  return (
    <div>
      <div style={eyebrowStyle}>Agenda</div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20
        }}
      >
        <h1 style={titleStyle}>Eventos do campus</h1>

        <button onClick={abrirNovo} style={newButton}>
          + Novo evento
        </button>
      </div>

      <p style={{ color: '#6B6880', margin: '-10px 0 22px' }}>
        CRUD completo pela API Laravel (PostgreSQL) e confirmação de presença via Strategy.
      </p>

      {aviso && <SuccessMessage message={aviso} />}

      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {['Todos', 'Inscrito', 'Vagas abertas', 'Lotados'].map((label) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            style={{
              height: 40,
              padding: '0 17px',
              borderRadius: 12,
              border: `1px solid ${filter === label ? '#0F8A6B' : '#E2E0EE'}`,
              background: filter === label ? '#0F8A6B' : '#fff',
              color: filter === label ? '#fff' : '#4A4857',
              fontWeight: 600
            }}
          >
            {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar evento"
          style={{
            height: 40,
            width: 240,
            border: '1px solid #E2E0EE',
            borderRadius: 12,
            padding: '0 14px',
            background: '#fff',
            outline: 'none'
          }}
        />
      </div>

      {loading && <Loading>Carregando eventos...</Loading>}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && filtered.length === 0 && (
        <Loading>Nenhum evento encontrado.</Loading>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {filtered.map((evento) => (
            <article
              key={evento._id}
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 6px 20px rgba(27,26,35,.05)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 14
                }}
              >
                <div
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: 1.3
                  }}
                >
                  {evento.title}
                </div>

                <StatusBadge status={evento.status} />
              </div>

              <div style={{ fontSize: 13.5, color: '#6B6880', margin: '14px 0' }}>
                {evento.org}
              </div>

              <div
                style={{
                  paddingTop: 14,
                  borderTop: '1px solid #F0EEF8',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 18,
                  fontSize: 13,
                  color: '#4A4857'
                }}
              >
                <span>{evento.dateLabel}</span>
                <span>{evento.time}</span>
                <span>{evento.place}</span>
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: '1px solid #F0EEF8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap'
                }}
              >
                {confirmarId === evento._id ? (
                  <>
                    <span style={{ fontSize: 13, color: '#B4234B', fontWeight: 600 }}>
                      Excluir este evento?
                    </span>
                    <div style={{ flex: 1 }} />
                    <button
                      onClick={() => excluir(evento._id)}
                      disabled={excluindoId === evento._id}
                      style={dangerButton}
                    >
                      {excluindoId === evento._id ? 'Excluindo...' : 'Confirmar'}
                    </button>
                    <button onClick={() => setConfirmarId(null)} style={ghostButton}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => confirmarPresencaEvento(evento._id)}
                      disabled={presencaId === evento._id}
                      style={ghostButton}
                    >
                      {presencaId === evento._id ? 'Confirmando...' : 'Confirmar presença'}
                    </button>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => abrirEdicao(evento)} style={ghostButton}>
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmarId(evento._id)}
                      style={dangerGhostButton}
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {formAberto && (
        <EventoForm
          evento={emEdicao}
          salvando={salvando}
          proximaOrdem={eventos.length + 1}
          onSalvar={salvar}
          onCancelar={fecharForm}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    inscrito: ['#0F8A6B', 'rgba(15,138,107,.1)', 'Inscrito'],
    vagas: ['#4A4857', 'rgba(74,72,87,.08)', 'Vagas abertas'],
    lotado: ['#B4234B', 'rgba(180,35,75,.1)', 'Lotado']
  };

  const [color, background, label] = map[status] || map.vagas;

  return (
    <div
      style={{
        fontWeight: 700,
        fontSize: 11.5,
        color,
        background,
        padding: '6px 11px',
        borderRadius: 9,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </div>
  );
}

const eyebrowStyle = {
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: '#8B88A0',
  marginBottom: 8
};

const titleStyle = {
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 800,
  fontSize: 34,
  letterSpacing: '-.03em',
  margin: '0 0 22px'
};

const newButton = {
  flex: 'none',
  height: 42,
  padding: '0 18px',
  border: 'none',
  borderRadius: 12,
  background: '#0F8A6B',
  color: '#fff',
  fontWeight: 700,
  fontSize: 14
};

const ghostButton = {
  height: 34,
  padding: '0 14px',
  borderRadius: 10,
  border: '1px solid #E2E0EE',
  background: '#fff',
  color: '#4A4857',
  fontWeight: 600,
  fontSize: 13
};

const dangerGhostButton = {
  height: 34,
  padding: '0 14px',
  borderRadius: 10,
  border: '1px solid #F3C6D2',
  background: '#fff',
  color: '#B4234B',
  fontWeight: 600,
  fontSize: 13
};

const dangerButton = {
  height: 34,
  padding: '0 14px',
  borderRadius: 10,
  border: 'none',
  background: '#B4234B',
  color: '#fff',
  fontWeight: 700,
  fontSize: 13
};
