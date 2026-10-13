import { useCallback, useEffect, useState } from 'react';
import {
  buscarInscricoesDoAluno,
  cancelarInscricao,
  inscreverEmEvento,
  pesquisar
} from '../../services/api.js';
import { useSession } from '../../context/SessionContext.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import { Loading, ErrorMessage, SuccessMessage, WarningMessage } from '../../components/Feedback.jsx';
import { Card, StatusBadge, GhostButton, PrimaryButton, DangerGhostButton } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

// CE02 / EE07 — detalhe do evento: inscrição e cancelamento do aluno
// (RF10-RF17) e, com o módulo geo, mapa do evento (AIE Google Maps) e a
// localização do usuário (AIE Geolocalização, RF27-RF29).
export default function EventoDetalhe({ eventoId, onVoltar }) {
  const { corPrimaria: brand, modulosAtivos } = useTenant();
  const { usuario } = useSession();
  const ehAluno = usuario.perfil === 'aluno';
  const [evento, setEvento] = useState(null);
  const [inscricao, setInscricao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const temGeo = modulosAtivos.includes('geo');

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await pesquisar('eventos', eventoId);
      setEvento(dados);

      if (ehAluno) {
        const inscricoes = await buscarInscricoesDoAluno(usuario.alunoId);
        setInscricao(inscricoes.find((i) => i.eventoId === dados._id) ?? null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message === 'Registro não encontrado.' ? 'Evento não encontrado.' : 'Não foi possível carregar o evento.');
    } finally {
      setLoading(false);
    }
  }, [eventoId, ehAluno, usuario.alunoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alternarInscricao() {
    try {
      setEnviando(true);
      setResultado(null);
      const resposta = inscricao
        ? await cancelarInscricao(inscricao._id)
        : await inscreverEmEvento(evento._id, usuario.alunoId);
      setResultado({ tipo: 'ok', texto: resposta.message });
      await carregar();
    } catch (err) {
      setResultado({ tipo: err.message.includes('já está inscrito') ? 'aviso' : 'erro', texto: err.message });
    } finally {
      setEnviando(false);
    }
  }

  if (loading && !evento) return <Loading>Carregando evento...</Loading>;
  if (error) return <ErrorMessage message={error} />;
  if (!evento) return null;

  const vagasRestantes = Math.max(evento.seatsTotal - evento.seatsUsed, 0);
  const lotado = vagasRestantes === 0;
  const seats = lotado ? 'Sem vagas disponíveis' : `${vagasRestantes} vagas restantes`;
  const pct = evento.seatsTotal ? Math.round((evento.seatsUsed / evento.seatsTotal) * 100) : 0;
  const situacao = inscricao ? 'inscrito' : lotado ? 'lotado' : 'vagas';

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
            <StatusBadge status={situacao} />
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
            <Metrica label="Horário" valor={evento.horaFim ? `${evento.time} – ${evento.horaFim}` : evento.time} />
            <Metrica label="Local" valor={evento.place} />
            <Metrica label="Carga horária" valor={evento.hours} />
          </div>

          {temGeo && <BlocoMapa evento={evento} brand={brand} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Vagas</div>
            <div style={{ fontSize: 13.5, color: brand, fontWeight: 600, marginBottom: 10 }}>{seats}</div>
            <div style={{ height: 8, borderRadius: 99, background: cores.divisor, overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: brand, borderRadius: 99 }} />
            </div>

            {ehAluno &&
              (inscricao ? (
                <DangerGhostButton onClick={alternarInscricao} disabled={enviando} style={{ width: '100%', height: 44, fontSize: 13.5 }}>
                  {enviando ? 'Cancelando...' : 'Cancelar inscrição'}
                </DangerGhostButton>
              ) : (
                <PrimaryButton brand={brand} onClick={alternarInscricao} disabled={enviando} style={{ width: '100%', height: 44, fontSize: 13.5 }}>
                  {enviando ? 'Inscrevendo...' : 'Inscrever-me'}
                </PrimaryButton>
              ))}

            {resultado && (
              <div style={{ marginTop: 16 }}>
                {resultado.tipo === 'ok' && <SuccessMessage message={resultado.texto} />}
                {resultado.tipo === 'aviso' && <WarningMessage message={resultado.texto} />}
                {resultado.tipo === 'erro' && <ErrorMessage message={resultado.texto} />}
              </div>
            )}
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

// Mapa (Google Maps embutido, sem chave de API), dados de local e a
// posição do usuário pela Geolocation API do navegador.
function BlocoMapa({ evento, brand }) {
  const [posicao, setPosicao] = useState(null);
  const [erroPosicao, setErroPosicao] = useState('');
  const [dispensado, setDispensado] = useState(false);

  const temCoordenadas = evento.latitude != null && evento.longitude != null;
  const consulta = temCoordenadas ? `${evento.latitude},${evento.longitude}` : evento.address || evento.place;
  const rota = posicao
    ? `https://www.google.com/maps/dir/?api=1&origin=${posicao.latitude},${posicao.longitude}&destination=${encodeURIComponent(consulta)}`
    : null;

  function permitir() {
    setErroPosicao('');
    if (!navigator.geolocation) {
      setErroPosicao('Este navegador não oferece geolocalização.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        setPosicao({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          precisao: Math.round(p.coords.accuracy),
          momento: new Date(p.timestamp).toLocaleString('pt-BR')
        }),
      () => setErroPosicao('Não foi possível obter sua localização.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px 0' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Local do evento no mapa</div>
          <div style={{ fontSize: 13.5, color: cores.textoSecundario, marginBottom: 16 }}>{evento.address || evento.place}</div>
        </div>
        <iframe
          title="Mapa do evento"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(consulta)}&z=16&output=embed`}
          style={{ width: '100%', height: 260, border: 0, display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {temCoordenadas && (
          <div style={{ display: 'flex', gap: 26, padding: '16px 22px' }}>
            <Metrica label="Latitude" valor={evento.latitude} />
            <Metrica label="Longitude" valor={evento.longitude} />
          </div>
        )}
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Minha localização</div>

        {posicao ? (
          <>
            <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginBottom: 16 }}>
              <Metrica label="Latitude" valor={posicao.latitude.toFixed(4)} />
              <Metrica label="Longitude" valor={posicao.longitude.toFixed(4)} />
              <Metrica label="Precisão (m)" valor={posicao.precisao} />
              <Metrica label="Momento" valor={posicao.momento} />
            </div>
            <a href={rota} target="_blank" rel="noreferrer" style={{ color: brand, fontWeight: 600, fontSize: 13.5 }}>
              Ver rota até o evento →
            </a>
          </>
        ) : (
          !dispensado && (
            <>
              <WarningMessage message="O navegador solicitará permissão para usar sua localização (RF27)." />
              <div style={{ display: 'flex', gap: 10 }}>
                <PrimaryButton brand={brand} onClick={permitir} style={{ height: 34, fontSize: 12.5, borderRadius: 10 }}>
                  Permitir
                </PrimaryButton>
                <GhostButton onClick={() => setDispensado(true)}>Agora não</GhostButton>
              </div>
            </>
          )
        )}
        {dispensado && !posicao && (
          <GhostButton onClick={() => setDispensado(false)}>Usar minha localização</GhostButton>
        )}
        {erroPosicao && (
          <div style={{ marginTop: 14 }}>
            <ErrorMessage message={erroPosicao} />
          </div>
        )}
      </Card>
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
