import { useCallback, useEffect, useState } from 'react';
import { buscarInscricoesDoAluno, emitirCertificado } from '../../services/api.js';
import { useSession } from '../../context/SessionContext.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback.jsx';
import { Card, EmptyState, GhostButton, PageHeader, PrimaryButton, StatusBadge } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';
import { TimelineAssinatura } from './CertificatesPage.jsx';
import { dadosCertificado } from './dadosCertificado.js';
import { gerarPdfCertificado } from './gerarPdfCertificado.js';

// SE02 / RF35-RF36 — certificado de participação do aluno: emitido depois
// da presença validada, com fluxo de dupla assinatura quando o tenant tem o
// módulo, e baixado em PDF.
export default function MeusCertificadosPage() {
  const { usuario } = useSession();
  const { corPrimaria: brand, modulosAtivos } = useTenant();
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [erros, setErros] = useState({});
  const [emitindoId, setEmitindoId] = useState(null);
  const [abertoId, setAbertoId] = useState(null);
  const temDualSignature = modulosAtivos.includes('dualSignature');

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setInscricoes(await buscarInscricoesDoAluno(usuario.alunoId));
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar seus certificados.');
    } finally {
      setLoading(false);
    }
  }, [usuario.alunoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function emitir(id) {
    try {
      setEmitindoId(id);
      setAviso('');
      setErros((atual) => ({ ...atual, [id]: '' }));
      const resposta = await emitirCertificado(id);
      setAviso(resposta.message);
      await carregar();
    } catch (err) {
      setErros((atual) => ({ ...atual, [id]: err.message }));
    } finally {
      setEmitindoId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Certificados"
        title="Meus certificados"
        subtitle="Gerado em PDF após presença validada (RF35–RF36)."
      />

      {aviso && <SuccessMessage message={aviso} />}
      {loading && <Loading>Carregando certificados...</Loading>}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && inscricoes.length === 0 && (
        <Card>
          <EmptyState>Você ainda não participou de nenhum evento.</EmptyState>
        </Card>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {inscricoes.map((inscricao) => {
            const evento = inscricao.evento;
            const certificado = inscricao.certificado;
            const liberado = certificado && (!temDualSignature || certificado.status === 'assinado');
            const dados = { nomeAluno: usuario.nome, matricula: certificado?.matricula ?? '', evento, certificado };

            return (
              <Card key={inscricao._id} style={{ padding: '26px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
                  <div>
                    <div style={{ fontFamily: fonteTitulo, fontWeight: 700, fontSize: 19, marginBottom: 7 }}>{evento.title}</div>
                    <div style={{ fontSize: 13.5, color: cores.textoSecundario, display: 'flex', gap: 10, alignItems: 'center' }}>
                      {evento.hours} · {evento.dateLabel}
                      {certificado && <StatusBadge status={certificado.status} />}
                    </div>
                  </div>

                  {!certificado && (
                    <PrimaryButton brand={brand} onClick={() => emitir(inscricao._id)} disabled={emitindoId === inscricao._id}>
                      {emitindoId === inscricao._id ? 'Emitindo...' : 'Emitir certificado'}
                    </PrimaryButton>
                  )}

                  {liberado && (
                    <span style={{ display: 'inline-flex', gap: 8 }}>
                      <GhostButton onClick={() => setAbertoId(abertoId === inscricao._id ? null : inscricao._id)}>
                        {abertoId === inscricao._id ? 'Ocultar' : 'Ver certificado'}
                      </GhostButton>
                      <PrimaryButton brand={brand} onClick={() => gerarPdfCertificado(dados, brand)} style={{ height: 34, fontSize: 13, borderRadius: 10 }}>
                        Baixar PDF
                      </PrimaryButton>
                    </span>
                  )}
                </div>

                {certificado && temDualSignature && <TimelineAssinatura assinado={certificado.status === 'assinado'} brand={brand} />}

                {erros[inscricao._id] && (
                  <div style={{ marginTop: 16 }}>
                    <ErrorMessage message={erros[inscricao._id]} />
                  </div>
                )}

                {liberado && abertoId === inscricao._id && <Previa dados={dados} brand={brand} />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Previa({ dados, brand }) {
  const { titulo, texto, emitidoEm, codigo, assinatura } = dadosCertificado(dados);

  return (
    <div style={{ marginTop: 20, border: `2px solid ${brand}`, borderRadius: 6, padding: '28px 32px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: fonteTitulo, fontSize: 22, letterSpacing: '.12em', color: brand, margin: '0 0 14px' }}>{titulo}</h2>
      <p style={{ fontSize: 14, lineHeight: 2.2, margin: 0 }}>{texto}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, fontSize: 12, color: cores.textoSecundario }}>
        <div>{emitidoEm}</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'cursive', fontSize: 20, color: cores.texto }}>Reitoria</div>
          <div style={{ borderTop: '1px solid #999', paddingTop: 4 }}>{assinatura}</div>
        </div>
        <div>{codigo}</div>
      </div>
    </div>
  );
}
