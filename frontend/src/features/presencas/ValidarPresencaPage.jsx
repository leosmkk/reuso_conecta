import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buscarPresencasDoEvento, pesquisar, validarPresenca } from '../../services/api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { Loading, ErrorMessage, SuccessMessage, WarningMessage } from '../../components/Feedback.jsx';
import { Campo, Card, GhostButton, PageHeader, PrimaryButton, inputStyle } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

// EE09 — Validar presença pela leitura do QR Code do aluno (RF24-RF26).
// A câmera usa a BarcodeDetector API quando o navegador tem; sem ela, o
// token (impresso abaixo do QR em "Minhas inscrições") é digitado.
export default function ValidarPresencaPage() {
  const { corPrimaria: brand } = useTenant();
  const [eventos, setEventos] = useState([]);
  const [inscricoes, setInscricoes] = useState([]);
  const [eventoId, setEventoId] = useState('');
  const [token, setToken] = useState('');
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [validando, setValidando] = useState(false);
  const [lendo, setLendo] = useState(false);
  const videoRef = useRef(null);
  const suportaCamera = typeof window !== 'undefined' && 'BarcodeDetector' in window && navigator.mediaDevices?.getUserMedia;

  const carregarCheckins = useCallback(async (id) => {
    if (!id) {
      setCheckins([]);
      return;
    }
    try {
      setCheckins(await buscarPresencasDoEvento(id));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    Promise.all([pesquisar('eventos'), pesquisar('inscricoes')])
      .then(([eventosDados, inscricoesDados]) => {
        setEventos(eventosDados);
        setInscricoes(inscricoesDados);
        if (eventosDados[0]) setEventoId(eventosDados[0]._id);
      })
      .catch((err) => {
        console.error(err);
        setError('Não foi possível carregar os eventos.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregarCheckins(eventoId);
  }, [eventoId, carregarCheckins]);

  // Prévia "Aluno lido do QR Code": cruza o token digitado/lido com as
  // inscrições do evento. A validação de verdade acontece no backend.
  const alunoLido = useMemo(
    () => inscricoes.find((i) => i.eventoId === eventoId && i.token === token.trim().toUpperCase()),
    [inscricoes, eventoId, token]
  );

  async function confirmar() {
    try {
      setValidando(true);
      setResultado(null);
      const resposta = await validarPresenca(eventoId, token.trim());
      setResultado({ tipo: 'ok', texto: resposta.message });
      await carregarCheckins(eventoId);
    } catch (err) {
      setResultado({ tipo: err.message.includes('já foi validada') ? 'aviso' : 'erro', texto: err.message });
    } finally {
      setValidando(false);
    }
  }

  function lerOutro() {
    setToken('');
    setResultado(null);
  }

  async function lerComCamera() {
    setLendo(true);
    setResultado(null);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const limite = Date.now() + 30000;

      while (Date.now() < limite) {
        const codigos = await detector.detect(video);
        if (codigos.length > 0) {
          setToken(codigos[0].rawValue);
          break;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
    } catch (err) {
      console.error(err);
      setResultado({ tipo: 'erro', texto: 'Não foi possível acessar a câmera.' });
    } finally {
      stream?.getTracks().forEach((t) => t.stop());
      setLendo(false);
    }
  }

  if (loading) return <Loading>Carregando...</Loading>;

  return (
    <div>
      <PageHeader eyebrow="Centro acadêmico" title="Validar presença" subtitle="Leitura do QR Code do aluno (RF24–RF26)." />

      {error && <ErrorMessage message={error} />}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18, alignItems: 'start' }}>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center', minHeight: 250 }}>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: '100%', borderRadius: 14, background: '#1B1A23', display: lendo ? 'block' : 'none' }}
          />
          {!lendo && (
            <div style={{ textAlign: 'center', color: cores.textoSecundario, fontSize: 13.5 }}>
              {suportaCamera
                ? 'Aponte a câmera para o QR Code do aluno.'
                : 'Este navegador não lê QR Code pela câmera. Digite o token do aluno.'}
            </div>
          )}
          {suportaCamera && (
            <GhostButton onClick={lerComCamera} disabled={lendo}>
              {lendo ? 'Lendo...' : 'Ler QR Code'}
            </GhostButton>
          )}
        </Card>

        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Campo label="Evento">
              <select value={eventoId} onChange={(e) => { setEventoId(e.target.value); lerOutro(); }} style={inputStyle}>
                {eventos.map((evento) => (
                  <option key={evento._id} value={evento._id}>
                    {evento.title}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Token do QR Code">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ex.: 8F9D3BBB"
                style={{ ...inputStyle, fontFamily: 'ui-monospace, Menlo, monospace' }}
              />
            </Campo>
            <Campo label="Aluno lido do QR Code">
              <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', color: alunoLido ? cores.texto : cores.eyebrow }}>
                {alunoLido ? alunoLido.alunoNome : '—'}
              </div>
            </Campo>
            <Campo label="Status de presença">
              <div style={{ ...inputStyle, display: 'flex', alignItems: 'center' }}>
                {resultado?.tipo === 'ok' ? 'Pendente → Presente' : 'Pendente'}
              </div>
            </Campo>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <PrimaryButton brand={brand} onClick={confirmar} disabled={validando || !token.trim() || !eventoId}>
              {validando ? 'Validando...' : 'Confirmar presença'}
            </PrimaryButton>
            <GhostButton onClick={lerOutro} style={{ height: 47, padding: '0 22px', fontSize: 14 }}>
              Ler outro
            </GhostButton>
          </div>

          <div style={{ marginTop: 18 }}>
            {resultado?.tipo === 'ok' && <SuccessMessage message={resultado.texto} />}
            {resultado?.tipo === 'aviso' && <WarningMessage message={resultado.texto} />}
            {resultado?.tipo === 'erro' && <ErrorMessage message={resultado.texto} />}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 26 }}>
        <h3 style={{ fontFamily: fonteTitulo, fontWeight: 700, fontSize: 17, letterSpacing: '-.02em', margin: '0 0 14px' }}>
          Check-ins do evento ({checkins.length})
        </h3>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {checkins.length === 0 ? (
            <div style={{ padding: 24, color: cores.textoSecundario, fontSize: 14 }}>Nenhuma presença registrada neste evento.</div>
          ) : (
            checkins.map((c) => (
              <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderTop: `1px solid ${cores.divisor}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ font: '600 14px Inter, sans-serif' }}>{c.alunoNome}</div>
                  <div style={{ fontSize: 12.5, color: cores.textoSecundario }}>
                    Matrícula {c.matricula} · {c.curso}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: cores.textoTerciario }}>
                  {c.metodo} · {c.dataHora}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
