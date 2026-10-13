import { useCallback, useEffect, useState } from 'react';
import { assinarCertificado, pesquisar } from '../../services/api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback.jsx';
import { Card, EmptyState, PageHeader, PrimaryButton } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

// Aprovação da Reitoria (módulo dualSignature): o Centro Acadêmico já
// confirmou presença e carga horária; aqui a Reitoria assina para liberar o
// PDF ao aluno.
export default function AprovacaoPage() {
  const { corPrimaria: brand } = useTenant();
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [assinandoId, setAssinandoId] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const todos = await pesquisar('certificados');
      setPendentes(todos.filter((c) => c.status === 'aguardando_reitoria'));
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os certificados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function assinar(id) {
    try {
      setAssinandoId(id);
      setError('');
      const resposta = await assinarCertificado(id);
      setAviso(resposta.message);
      await carregar();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssinandoId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Reitoria"
        title="Aprovação de certificados"
        subtitle="Certificados confirmados pelos centros acadêmicos que aguardam a assinatura da Reitoria."
      />

      {aviso && <SuccessMessage message={aviso} />}
      {loading && <Loading>Carregando certificados...</Loading>}
      {error && <ErrorMessage message={error} />}

      {!loading && pendentes.length === 0 && (
        <Card>
          <EmptyState>Nenhum certificado aguardando assinatura.</EmptyState>
        </Card>
      )}

      {!loading && pendentes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pendentes.map((certificado) => (
            <Card key={certificado._id} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fonteTitulo, fontWeight: 700, fontSize: 17 }}>{certificado.title}</div>
                <div style={{ fontSize: 13.5, color: cores.textoSecundario, marginTop: 6 }}>
                  {certificado.alunoNome ? `${certificado.alunoNome} · matrícula ${certificado.matricula} · ` : ''}
                  {certificado.hours} · {certificado.completedAt}
                </div>
              </div>
              <PrimaryButton brand={brand} onClick={() => assinar(certificado._id)} disabled={assinandoId === certificado._id}>
                {assinandoId === certificado._id ? 'Assinando...' : 'Assinar'}
              </PrimaryButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
