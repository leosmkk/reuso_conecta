import { useMemo, useState } from 'react';
import { confirmarPresenca } from '../../services/api.js';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import { useCrud } from '../../hooks/useCrud.js';
import { PageHeader, Card, PrimaryButton, GhostButton, DangerButton, DangerGhostButton, StatusBadge } from '../../components/ui.jsx';
import { cores } from '../../theme.js';
import EventoForm from './EventoForm.jsx';

export default function AgendaPage({ onAbrirDetalhe }) {
  const { corPrimaria: brand } = useTenant();
  const crud = useCrud('eventos');
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [presencaId, setPresencaId] = useState(null);

  async function confirmarPresencaEvento(id) {
    try {
      setPresencaId(id);
      const resultado = await confirmarPresenca(id, { confirmado_por: 'Painel da Agenda' });
      crud.notificar(resultado.message);
    } catch (err) {
      console.error(err);
      crud.notificar(`Não foi possível confirmar presença: ${err.message}`);
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

    return crud.registros.filter((evento) => {
      const matchesStatus =
        filter === 'Todos' || evento.status === statusMap[filter];

      const matchesSearch =
        evento.title?.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [crud.registros, filter, search]);

  return (
    <div>
      <PageHeader
        eyebrow="Agenda"
        title="Eventos do campus"
        subtitle="CRUD completo pela API Laravel (PostgreSQL) e confirmação de presença via Strategy."
        action={
          <PrimaryButton brand={brand} onClick={crud.abrirNovo}>
            + Novo evento
          </PrimaryButton>
        }
      />

      {crud.aviso && <SuccessMessage message={crud.aviso} />}

      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {['Todos', 'Inscrito', 'Vagas abertas', 'Lotados'].map((label) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            style={{
              height: 40,
              padding: '0 17px',
              borderRadius: 12,
              border: `1px solid ${filter === label ? brand : cores.borda}`,
              background: filter === label ? brand : '#fff',
              color: filter === label ? '#fff' : cores.textoTerciario,
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
            border: `1px solid ${cores.borda}`,
            borderRadius: 12,
            padding: '0 14px',
            background: '#fff',
            outline: 'none'
          }}
        />
      </div>

      {crud.loading && <Loading>Carregando eventos...</Loading>}
      {crud.error && <ErrorMessage message={crud.error} />}

      {!crud.loading && !crud.error && filtered.length === 0 && (
        <Loading>Nenhum evento encontrado.</Loading>
      )}

      {!crud.loading && !crud.error && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {filtered.map((evento) => (
            <Card key={evento._id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                onClick={() => onAbrirDetalhe?.(evento._id)}
                style={{ cursor: onAbrirDetalhe ? 'pointer' : 'default' }}
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

                <div style={{ fontSize: 13.5, color: cores.textoSecundario, margin: '14px 0' }}>
                  {evento.org}
                </div>

                <div
                  style={{
                    paddingTop: 14,
                    borderTop: `1px solid ${cores.divisor}`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 18,
                    fontSize: 13,
                    color: cores.textoTerciario
                  }}
                >
                  <span>{evento.dateLabel}</span>
                  <span>{evento.time}</span>
                  <span>{evento.place}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: `1px solid ${cores.divisor}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap'
                }}
              >
                {crud.confirmarId === evento._id ? (
                  <>
                    <span style={{ fontSize: 13, color: cores.perigo, fontWeight: 600 }}>
                      Excluir este evento?
                    </span>
                    <div style={{ flex: 1 }} />
                    <DangerButton
                      onClick={() => crud.remover(evento._id)}
                      disabled={crud.excluindoId === evento._id}
                    >
                      {crud.excluindoId === evento._id ? 'Excluindo...' : 'Confirmar'}
                    </DangerButton>
                    <GhostButton onClick={() => crud.setConfirmarId(null)}>Cancelar</GhostButton>
                  </>
                ) : (
                  <>
                    <GhostButton
                      onClick={() => confirmarPresencaEvento(evento._id)}
                      disabled={presencaId === evento._id}
                    >
                      {presencaId === evento._id ? 'Confirmando...' : 'Confirmar presença'}
                    </GhostButton>
                    <div style={{ flex: 1 }} />
                    <GhostButton onClick={() => crud.abrirEdicao(evento)}>Editar</GhostButton>
                    <DangerGhostButton onClick={() => crud.setConfirmarId(evento._id)}>
                      Excluir
                    </DangerGhostButton>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {crud.formAberto && (
        <EventoForm
          evento={crud.emEdicao}
          salvando={crud.salvando}
          proximaOrdem={crud.registros.length + 1}
          onSalvar={crud.salvar}
          onCancelar={crud.fecharForm}
        />
      )}
    </div>
  );
}
