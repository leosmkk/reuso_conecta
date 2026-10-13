import { useState } from 'react';
import { gerarDocumentoCertificado } from '../../services/api.js';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import { useCrud } from '../../hooks/useCrud.js';
import { PageHeader, Card, PrimaryButton, GhostButton, DangerButton, DangerGhostButton, StatusBadge, Modal, Campo, inputStyle } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

const STATUS_OPCOES = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'aguardando_reitoria', label: 'Aguardando Reitoria' },
  { value: 'assinado', label: 'Assinado' }
];

// Porta de ConectaCampus.dc.html:311-356 (Meus certificados), agora com
// CRUD completo. Quando o tenant tem o módulo dualSignature, o card mostra
// a timeline de 3 etapas em vez do botão direto de gerar — a assinatura da
// Reitoria acontece editando o status aqui mesmo (não existe tela própria
// de Aprovação).
export default function CertificatesPage() {
  const { corPrimaria: brand, modulosAtivos } = useTenant();
  const crud = useCrud('certificados');
  const [gerandoId, setGerandoId] = useState(null);
  const [documentos, setDocumentos] = useState({});
  const [erroDocumento, setErroDocumento] = useState({});
  const temDualSignature = modulosAtivos.includes('dualSignature');

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
      <PageHeader
        eyebrow="Certificados"
        title="Meus certificados"
        subtitle={'"Gerar certificado" chama o Template Method (App\\Patterns\\TemplateMethod) da API Laravel.'}
        action={
          <PrimaryButton brand={brand} onClick={crud.abrirNovo}>
            + Novo certificado
          </PrimaryButton>
        }
      />

      {crud.aviso && <SuccessMessage message={crud.aviso} />}
      {crud.loading && <Loading>Carregando certificados...</Loading>}
      {crud.error && <ErrorMessage message={crud.error} />}

      {!crud.loading && !crud.error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {crud.registros.map((certificado) => {
            const id = certificado._id;
            const assinado = certificado.status === 'assinado';

            return (
              <Card key={id} style={{ padding: '26px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
                  <div>
                    <div style={{ fontFamily: fonteTitulo, fontWeight: 700, fontSize: 19, marginBottom: 7 }}>
                      {certificado.title}
                    </div>
                    <div style={{ fontSize: 13.5, color: cores.textoSecundario, display: 'flex', gap: 10, alignItems: 'center' }}>
                      {certificado.hours} · {certificado.completedAt}
                      <StatusBadge status={certificado.status} />
                    </div>
                  </div>

                  {crud.confirmarId === id ? (
                    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      <DangerButton onClick={() => crud.remover(id)} disabled={crud.excluindoId === id}>
                        {crud.excluindoId === id ? 'Excluindo...' : 'Confirmar exclusão'}
                      </DangerButton>
                      <GhostButton onClick={() => crud.setConfirmarId(null)}>Cancelar</GhostButton>
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', gap: 8 }}>
                      <GhostButton onClick={() => crud.abrirEdicao(certificado)}>Editar</GhostButton>
                      <DangerGhostButton onClick={() => crud.setConfirmarId(id)}>Excluir</DangerGhostButton>
                    </span>
                  )}
                </div>

                {temDualSignature ? (
                  <TimelineAssinatura assinado={assinado} brand={brand} />
                ) : (
                  <div style={{ marginTop: 18 }}>
                    <PrimaryButton brand={brand} onClick={() => gerarCertificado(id)} disabled={gerandoId === id}>
                      {gerandoId === id ? 'Gerando...' : 'Gerar certificado'}
                    </PrimaryButton>
                  </div>
                )}

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
              </Card>
            );
          })}
        </div>
      )}

      {crud.formAberto && (
        <CertificadoForm
          certificado={crud.emEdicao}
          salvando={crud.salvando}
          brand={brand}
          onSalvar={crud.salvar}
          onCancelar={crud.fecharForm}
        />
      )}
    </div>
  );
}

function TimelineAssinatura({ assinado, brand }) {
  const etapas = [
    { label: 'Centro acadêmico confirma', hint: 'Presença e carga horária validadas pela organização.', done: true },
    { label: 'Reitoria assina', hint: 'Assinatura digital do documento pela reitoria.', done: assinado },
    { label: 'Aluno baixa o PDF', hint: 'Certificado disponível na área do aluno.', done: assinado }
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {etapas.map((etapa, i) => (
          <div key={etapa.label} style={{ display: 'flex', alignItems: 'flex-start', flex: i === etapas.length - 1 ? 'none' : 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: i === etapas.length - 1 ? 0 : 12 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: '700 12.5px Inter, sans-serif',
                  background: etapa.done ? brand : cores.divisor,
                  color: etapa.done ? '#fff' : cores.eyebrow,
                  marginBottom: 10
                }}
              >
                {etapa.done ? '✓' : i + 1}
              </div>
              {i !== etapas.length - 1 && <div style={{ flex: 1, width: 2, minHeight: 20, background: etapa.done ? brand : cores.divisor }} />}
            </div>
            <div style={{ paddingRight: 20, maxWidth: 220 }}>
              <div style={{ font: '600 13.5px Inter, sans-serif', marginBottom: 4 }}>{etapa.label}</div>
              <div style={{ fontSize: 12.5, color: cores.eyebrow, lineHeight: 1.5 }}>{etapa.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {!assinado && (
        <button
          disabled
          style={{
            marginTop: 18,
            height: 44,
            padding: '0 22px',
            border: `1px solid ${cores.borda}`,
            borderRadius: 13,
            background: '#fff',
            color: cores.eyebrow,
            font: '600 13.5px Inter, sans-serif',
            cursor: 'not-allowed'
          }}
        >
          Aguardando assinatura da Reitoria
        </button>
      )}
    </div>
  );
}

function CertificadoForm({ certificado, salvando, brand, onSalvar, onCancelar }) {
  const editando = Boolean(certificado);
  const [form, setForm] = useState(() => ({
    title: certificado?.title ?? '',
    hours: certificado?.hours ?? '',
    completedAt: certificado?.completedAt ?? '',
    status: certificado?.status ?? 'disponivel',
    order: certificado?.order ?? 1
  }));

  function set(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function submeter(e) {
    e.preventDefault();
    onSalvar({ ...form, order: Number(form.order) || 0 });
  }

  return (
    <Modal onFechar={onCancelar}>
      <form onSubmit={submeter}>
        <h2 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', margin: '0 0 26px' }}>
          {editando ? 'Editar certificado' : 'Cadastrar certificado'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          <Campo full label="Título">
            <input required value={form.title} onChange={(e) => set('title', e.target.value)} style={inputStyle} />
          </Campo>
          <Campo label="Carga horária">
            <input placeholder="12h" value={form.hours} onChange={(e) => set('hours', e.target.value)} style={inputStyle} />
          </Campo>
          <Campo label="Concluído em">
            <input
              placeholder="concluído em 12 de setembro de 2026"
              value={form.completedAt}
              onChange={(e) => set('completedAt', e.target.value)}
              style={inputStyle}
            />
          </Campo>
          <Campo label="Status">
            <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inputStyle}>
              {STATUS_OPCOES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Ordem na lista">
            <input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} style={inputStyle} />
          </Campo>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
          <PrimaryButton type="submit" brand={brand} disabled={salvando}>
            {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
          </PrimaryButton>
          <GhostButton type="button" onClick={onCancelar} style={{ height: 47, padding: '0 22px', fontSize: 14 }}>
            Cancelar
          </GhostButton>
        </div>
      </form>
    </Modal>
  );
}
