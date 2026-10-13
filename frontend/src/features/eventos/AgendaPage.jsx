import { useEffect, useMemo, useState } from 'react';
import { buscarInscricoesDoAluno, confirmarPresenca } from '../../services/api.js';
import { Loading, ErrorMessage, SuccessMessage, WarningMessage } from '../../components/Feedback.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import { useCrud } from '../../hooks/useCrud.js';
import { PageHeader, Card, Modal, PrimaryButton, GhostButton, DangerButton, DangerGhostButton, StatusBadge } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';
import EventoForm from './EventoForm.jsx';

const MENSAGENS = {
  inserido: 'Evento inserido com sucesso.',
  alterado: 'Evento alterado com sucesso.',
  excluido: 'Evento excluído com sucesso.'
};

// CE01 — agenda com filtros pela situação do aluno e pelas vagas
// (RF18-RF22). O Centro Acadêmico também cadastra (EE01), altera (EE02) e
// exclui (EE03) eventos por aqui.
export default function AgendaPage({ onAbrirDetalhe }) {
  const { corPrimaria: brand } = useTenant();
  const { usuario } = useSession();
  const ehAluno = usuario.perfil === 'aluno';
  const ehCentro = usuario.perfil === 'centro';
  const crud = useCrud('eventos', { mensagens: MENSAGENS });
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [presencaId, setPresencaId] = useState(null);
  const [inscritos, setInscritos] = useState(new Set());

  useEffect(() => {
    if (!ehAluno) return;
    buscarInscricoesDoAluno(usuario.alunoId)
      .then((inscricoes) => setInscritos(new Set(inscricoes.map((i) => i.eventoId))))
      .catch((err) => console.error('Não foi possível carregar as inscrições:', err));
  }, [ehAluno, usuario.alunoId]);

  // Situação exibida: o aluno vê "Inscrito" nos eventos em que tem inscrição;
  // nos demais vale a ocupação das vagas.
  function situacao(evento) {
    if (ehAluno && inscritos.has(evento._id)) return 'inscrito';
    return evento.seatsUsed >= evento.seatsTotal ? 'lotado' : 'vagas';
  }

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

  function limpar() {
    setFilter('Todos');
    setSearch('');
  }

  const filtros = ehAluno ? ['Inscrito', 'Com vagas', 'Lotados', 'Todos'] : ['Com vagas', 'Lotados', 'Todos'];

  const filtered = useMemo(() => {
    const statusMap = {
      Inscrito: 'inscrito',
      'Com vagas': 'vagas',
      Lotados: 'lotado'
    };

    return crud.registros.filter((evento) => {
      const matchesStatus = filter === 'Todos' || situacao(evento) === statusMap[filter];

      const matchesSearch = evento.title?.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.registros, filter, search, inscritos]);

  const eventoParaExcluir = crud.registros.find((e) => e._id === crud.confirmarId);

  return (
    <div>
      <PageHeader
        eyebrow="Agenda"
        title="Agenda de eventos"
        subtitle="Filtros por situação do aluno e vagas (RF18–RF22)."
        action={
          ehCentro && (
            <PrimaryButton brand={brand} onClick={crud.abrirNovo}>
              + Novo evento
            </PrimaryButton>
          )
        }
      />

      {crud.aviso && <SuccessMessage message={crud.aviso} />}

      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {filtros.map((label) => (
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
        <GhostButton onClick={limpar} style={{ height: 40, borderRadius: 12 }}>
          Limpar
        </GhostButton>
      </div>

      {crud.loading && <Loading>Carregando eventos...</Loading>}
      {crud.error && !crud.confirmarId && <ErrorMessage message={crud.error} />}

      {!crud.loading && !crud.error && filtered.length === 0 && (
        <WarningMessage message="Nenhum evento encontrado para o filtro selecionado." />
      )}

      {!crud.loading && filtered.length > 0 && (
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
                      fontFamily: fonteTitulo,
                      fontWeight: 700,
                      fontSize: 18,
                      lineHeight: 1.3
                    }}
                  >
                    {evento.title}
                  </div>

                  <StatusBadge status={situacao(evento)} />
                </div>

                <div style={{ fontSize: 13.5, color: cores.textoSecundario, margin: '14px 0' }}>
                  {evento.org}
                  {evento.speaker && ` · ${evento.speaker}`}
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
                  <span>{Math.max(evento.seatsTotal - evento.seatsUsed, 0)} vagas</span>
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
                <GhostButton onClick={() => onAbrirDetalhe?.(evento._id)}>Ver detalhes</GhostButton>
                <div style={{ flex: 1 }} />
                {ehCentro && (
                  <>
                    <GhostButton
                      onClick={() => confirmarPresencaEvento(evento._id)}
                      disabled={presencaId === evento._id}
                    >
                      {presencaId === evento._id ? 'Confirmando...' : 'Confirmar presença'}
                    </GhostButton>
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

      {eventoParaExcluir && (
        <Modal onFechar={() => crud.setConfirmarId(null)} largura={460}>
          <h2 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', margin: '0 0 16px' }}>
            Excluir evento
          </h2>
          <div
            style={{
              border: `1px solid ${cores.borda}`,
              borderRadius: 12,
              background: cores.inputFundo,
              padding: '11px 13px',
              fontWeight: 700,
              marginBottom: 14
            }}
          >
            {eventoParaExcluir.title}
          </div>
          <WarningMessage message="Excluir este evento? Esta ação não pode ser desfeita." />
          {crud.error && <ErrorMessage message={crud.error.replace(/^Não foi possível excluir o registro: /, '')} />}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <DangerButton
              onClick={() => crud.remover(eventoParaExcluir._id)}
              disabled={crud.excluindoId === eventoParaExcluir._id}
              style={{ height: 42, padding: '0 22px', fontSize: 13.5 }}
            >
              {crud.excluindoId === eventoParaExcluir._id ? 'Excluindo...' : 'Confirmar'}
            </DangerButton>
            <GhostButton onClick={() => crud.setConfirmarId(null)} style={{ height: 42, padding: '0 22px' }}>
              Cancelar
            </GhostButton>
          </div>
        </Modal>
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
