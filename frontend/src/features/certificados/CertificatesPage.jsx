import { useEffect, useState } from 'react';
import { buscarCertificados, gerarDocumentoCertificado } from '../../services/api.js';
import { Loading, ErrorMessage } from '../../components/Feedback.jsx';

export default function CertificatesPage() {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gerandoId, setGerandoId] = useState(null);
  const [documentos, setDocumentos] = useState({});
  const [erroDocumento, setErroDocumento] = useState({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await buscarCertificados();
        setCertificados(data);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os certificados pela API.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function gerarCertificado(id) {
    try {
      setGerandoId(id);
      setErroDocumento((atual) => ({ ...atual, [id]: '' }));
      const resultado = await gerarDocumentoCertificado(id);
      setDocumentos((atual) => ({ ...atual, [id]: resultado.documento }));
    } catch (err) {
      console.error(err);
      setErroDocumento((atual) => ({ ...atual, [id]: err.message }));
    } finally {
      setGerandoId(null);
    }
  }

  return (
    <div>
      <div style={eyebrowStyle}>Certificados</div>

      <h1 style={titleStyle}>Meus certificados</h1>

      <p style={{ color: '#6B6880', margin: '-10px 0 22px' }}>
        "Gerar certificado" chama o Template Method (App\Patterns\TemplateMethod) da API Laravel.
      </p>

      {loading && <Loading>Carregando certificados...</Loading>}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {certificados.map((certificado) => {
            const id = certificado._id ?? certificado.id;

            return (
              <article
                key={id}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '26px 28px',
                  boxShadow: '0 6px 20px rgba(27,26,35,.05)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 20
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 700,
                        fontSize: 19,
                        marginBottom: 7
                      }}
                    >
                      {certificado.title}
                    </div>

                    <div style={{ fontSize: 13.5, color: '#6B6880' }}>
                      {certificado.hours} · {certificado.completedAt}
                    </div>
                  </div>

                  <button
                    onClick={() => gerarCertificado(id)}
                    disabled={gerandoId === id}
                    style={{
                      height: 44,
                      padding: '0 22px',
                      border: 'none',
                      borderRadius: 13,
                      background: '#0F8A6B',
                      color: '#fff',
                      fontWeight: 700
                    }}
                  >
                    {gerandoId === id ? 'Gerando...' : 'Gerar certificado'}
                  </button>
                </div>

                {erroDocumento[id] && (
                  <div style={{ marginTop: 16 }}>
                    <ErrorMessage message={erroDocumento[id]} />
                  </div>
                )}

                {documentos[id] && (
                  <pre
                    style={{
                      marginTop: 16,
                      padding: 18,
                      background: '#F8F7FC',
                      borderRadius: 14,
                      fontSize: 13,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      color: '#2C2A38'
                    }}
                  >
                    {documentos[id]}
                  </pre>
                )}
              </article>
            );
          })}
        </div>
      )}
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
