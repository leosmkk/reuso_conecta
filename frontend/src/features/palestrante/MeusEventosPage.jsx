import { useEffect, useState } from 'react';
import { pesquisar } from '../../services/api.js';
import { useSession } from '../../context/SessionContext.jsx';
import { Loading, ErrorMessage } from '../../components/Feedback.jsx';
import { Card, EmptyState, PageHeader, StatusBadge } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

// "Meus eventos" do palestrante: eventos em que ele está como palestrante.
export default function MeusEventosPage({ onAbrirDetalhe }) {
  const { usuario } = useSession();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    pesquisar('eventos')
      .then((dados) => setEventos(dados.filter((e) => e.palestranteId === usuario.palestranteId)))
      .catch((err) => {
        console.error(err);
        setError('Não foi possível carregar seus eventos.');
      })
      .finally(() => setLoading(false));
  }, [usuario.palestranteId]);

  return (
    <div>
      <PageHeader eyebrow="Palestrante" title="Meus eventos" subtitle="Eventos em que você é o palestrante." />

      {loading && <Loading>Carregando eventos...</Loading>}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && eventos.length === 0 && (
        <Card>
          <EmptyState>Nenhum evento vinculado ao seu cadastro.</EmptyState>
        </Card>
      )}

      {!loading && !error && eventos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {eventos.map((evento) => (
            <Card key={evento._id}>
              <div onClick={() => onAbrirDetalhe?.(evento._id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                  <div style={{ fontFamily: fonteTitulo, fontWeight: 700, fontSize: 18, lineHeight: 1.3 }}>{evento.title}</div>
                  <StatusBadge status={evento.realizado ? 'realizado' : 'aguardando'} mapa={STATUS} />
                </div>
                <div style={{ fontSize: 13.5, color: cores.textoSecundario, margin: '14px 0' }}>{evento.org}</div>
                <div style={{ paddingTop: 14, borderTop: `1px solid ${cores.divisor}`, display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13, color: cores.textoTerciario }}>
                  <span>{evento.dateLabel}</span>
                  <span>
                    {evento.time}
                    {evento.horaFim ? ` – ${evento.horaFim}` : ''}
                  </span>
                  <span>{evento.place}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS = {
  realizado: [cores.verdeMarca, 'rgba(15,138,107,.1)', 'Realizado'],
  aguardando: [cores.textoTerciario, 'rgba(74,72,87,.08)', 'Agendado']
};
