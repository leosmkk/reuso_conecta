import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { buscarInscricoesDoAluno, cancelarInscricao } from '../../services/api.js';
import { useSession } from '../../context/SessionContext.jsx';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback.jsx';
import { Card, DangerGhostButton, EmptyState, PageHeader, StatusBadge } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

const STATUS_PRESENCA = {
  presente: [cores.verdeMarca, 'rgba(15,138,107,.1)', 'Presente'],
  pendente: [cores.textoTerciario, 'rgba(74,72,87,.08)', 'Presença pendente']
};

// EE08 — "Minhas inscrições": cancelar libera a vaga (RF16-RF17). O QR Code
// carrega o token da inscrição que o Centro Acadêmico lê em Validar presença.
export default function MinhasInscricoesPage({ onAbrirDetalhe }) {
  const { usuario } = useSession();
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [erroCancelar, setErroCancelar] = useState({});
  const [cancelandoId, setCancelandoId] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setInscricoes(await buscarInscricoesDoAluno(usuario.alunoId));
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar suas inscrições.');
    } finally {
      setLoading(false);
    }
  }, [usuario.alunoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function cancelar(id) {
    try {
      setCancelandoId(id);
      setAviso('');
      setErroCancelar((atual) => ({ ...atual, [id]: '' }));
      const resposta = await cancelarInscricao(id);
      setAviso(resposta.message);
      await carregar();
    } catch (err) {
      setErroCancelar((atual) => ({ ...atual, [id]: err.message }));
    } finally {
      setCancelandoId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Meus eventos"
        title="Minhas inscrições"
        subtitle="Cancelamento libera a vaga ocupada (RF16–RF17)."
      />

      {aviso && <SuccessMessage message={aviso} />}
      {loading && <Loading>Carregando inscrições...</Loading>}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && inscricoes.length === 0 && (
        <Card>
          <EmptyState>Você ainda não se inscreveu em nenhum evento.</EmptyState>
        </Card>
      )}

      {!loading && !error && inscricoes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {inscricoes.map((inscricao) => {
            const evento = inscricao.evento;

            return (
              <Card key={inscricao._id} style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div
                  style={{ padding: 10, background: '#fff', border: `1px solid ${cores.borda}`, borderRadius: 14, flex: 'none' }}
                  title={`Token ${inscricao.token}`}
                >
                  <QRCodeSVG value={inscricao.token} size={110} />
                  <div style={{ textAlign: 'center', font: '600 11px ui-monospace, Menlo, monospace', color: cores.textoSecundario, marginTop: 6 }}>
                    {inscricao.token}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                    <button
                      onClick={() => onAbrirDetalhe?.(evento._id)}
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        textAlign: 'left',
                        fontFamily: fonteTitulo,
                        fontWeight: 700,
                        fontSize: 18,
                        lineHeight: 1.3,
                        color: cores.texto
                      }}
                    >
                      {evento.title}
                    </button>
                    <StatusBadge status={inscricao.presente ? 'presente' : 'pendente'} mapa={STATUS_PRESENCA} />
                  </div>

                  <div style={{ fontSize: 13.5, color: cores.textoSecundario, margin: '10px 0 14px' }}>
                    {evento.dateLabel} · {evento.time} · {evento.place}
                  </div>

                  <DangerGhostButton onClick={() => cancelar(inscricao._id)} disabled={cancelandoId === inscricao._id}>
                    {cancelandoId === inscricao._id ? 'Cancelando...' : 'Cancelar inscrição'}
                  </DangerGhostButton>

                  {erroCancelar[inscricao._id] && (
                    <div style={{ marginTop: 14 }}>
                      <ErrorMessage message={erroCancelar[inscricao._id]} />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
