import { useState } from 'react';
import { alternarModulo } from '../../services/api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { useCrud } from '../../hooks/useCrud.js';
import { Loading, ErrorMessage, SuccessMessage } from '../../components/Feedback.jsx';
import { PageHeader, Card, PrimaryButton, GhostButton, DangerButton, DangerGhostButton, Modal, Campo, inputStyle } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';

const ICONES = {
  geo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  ),
  qrcode: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.6" />
      <path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M20 20v.01" />
    </svg>
  ),
  advReports: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  ),
  dualSignature: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18c3-1 3-9 6-9s3 6 6 6 2-4 4-4" />
      <path d="M3 21h18" />
    </svg>
  ),
  customField: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
};

// Porta de ConectaCampus.dc.html:518-544 (Central de módulos) — o switch
// aqui é a única mutação do mockup que já era "real" (ligava/desligava uma
// flag em memória); agora ele chama PUT /api/tenants/{id}/modulos/{chave}
// de verdade e recarrega o TenantContext, então o menu (gateado por
// modulosAtivos) reage sem F5. O CRUD do catálogo (criar/editar/excluir
// módulo) fica abaixo, à parte do toggle.
export default function ModulosPage() {
  const { id: tenantId, nome, corPrimaria: brand, modulosAtivos, recarregar } = useTenant();
  const crud = useCrud('modulos');
  const [alternandoChave, setAlternandoChave] = useState(null);

  async function toggle(modulo) {
    if (!tenantId) return;
    const ativo = !modulosAtivos.includes(modulo.chave);

    try {
      setAlternandoChave(modulo.chave);
      const resultado = await alternarModulo(tenantId, modulo.chave, ativo);
      crud.notificar(resultado.message);
      await recarregar();
    } catch (err) {
      console.error(err);
      crud.notificar(`Não foi possível alternar o módulo: ${err.message}`);
    } finally {
      setAlternandoChave(null);
    }
  }

  return (
    <div style={{ maxWidth: 840 }}>
      <PageHeader
        eyebrow="Administração"
        title="Central de módulos"
        subtitle={`Contratação de ${nome} · ${modulosAtivos.length} de ${crud.registros.length || 5} módulos ativos`}
        action={
          <PrimaryButton brand={brand} onClick={crud.abrirNovo}>
            + Novo módulo
          </PrimaryButton>
        }
      />

      {crud.aviso && <SuccessMessage message={crud.aviso} />}
      {crud.loading && <Loading>Carregando módulos...</Loading>}
      {crud.error && <ErrorMessage message={crud.error} />}

      {!crud.loading && !crud.error && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {crud.registros.map((modulo) => {
            const ativo = modulosAtivos.includes(modulo.chave);
            const excluindo = crud.confirmarId === modulo._id;

            return (
              <div
                key={modulo._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '22px 28px',
                  borderTop: `1px solid ${cores.divisor}`
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: ativo ? `${brand}1A` : cores.fundo,
                    color: ativo ? brand : cores.eyebrow
                  }}
                >
                  {ICONES[modulo.chave] || (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 15.5px Inter, sans-serif', marginBottom: 5 }}>{modulo.nome}</div>
                  <div style={{ fontSize: 13.5, color: cores.textoSecundario, lineHeight: 1.5 }}>{modulo.descricao}</div>
                </div>

                {excluindo ? (
                  <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                    <DangerButton onClick={() => crud.remover(modulo._id)} disabled={crud.excluindoId === modulo._id}>
                      {crud.excluindoId === modulo._id ? 'Excluindo...' : 'Confirmar'}
                    </DangerButton>
                    <GhostButton onClick={() => crud.setConfirmarId(null)}>Cancelar</GhostButton>
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', gap: 8 }}>
                    <GhostButton onClick={() => crud.abrirEdicao(modulo)}>Editar</GhostButton>
                    <DangerGhostButton onClick={() => crud.setConfirmarId(modulo._id)}>Excluir</DangerGhostButton>
                  </span>
                )}

                <div style={{ font: '600 12.5px Inter, sans-serif', color: cores.eyebrow, width: 56, textAlign: 'right' }}>
                  {ativo ? 'Ativo' : 'Inativo'}
                </div>

                <button
                  onClick={() => toggle(modulo)}
                  disabled={alternandoChave === modulo.chave || !tenantId}
                  style={{
                    width: 50,
                    height: 29,
                    flex: 'none',
                    borderRadius: 99,
                    border: 'none',
                    padding: 3,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: ativo ? 'flex-end' : 'flex-start',
                    alignItems: 'center',
                    background: ativo ? brand : cores.toggleOff,
                    opacity: alternandoChave === modulo.chave ? 0.6 : 1,
                    transition: 'background .18s'
                  }}
                >
                  <span style={{ width: 23, height: 23, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(27,26,35,.28)', display: 'block' }} />
                </button>
              </div>
            );
          })}
        </Card>
      )}

      {crud.formAberto && (
        <ModuloForm
          modulo={crud.emEdicao}
          salvando={crud.salvando}
          brand={brand}
          onSalvar={crud.salvar}
          onCancelar={crud.fecharForm}
        />
      )}
    </div>
  );
}

function ModuloForm({ modulo, salvando, brand, onSalvar, onCancelar }) {
  const editando = Boolean(modulo);
  const [form, setForm] = useState(() => ({
    chave: modulo?.chave ?? '',
    nome: modulo?.nome ?? '',
    descricao: modulo?.descricao ?? ''
  }));

  function set(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  return (
    <Modal onFechar={onCancelar}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSalvar(form);
        }}
      >
        <h2 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', margin: '0 0 26px' }}>
          {editando ? 'Editar módulo' : 'Cadastrar módulo'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          <Campo full label="Chave (usada nas flags dos tenants)">
            <input required value={form.chave} onChange={(e) => set('chave', e.target.value)} style={inputStyle} />
          </Campo>
          <Campo full label="Nome">
            <input required value={form.nome} onChange={(e) => set('nome', e.target.value)} style={inputStyle} />
          </Campo>
          <Campo full label="Descrição">
            <input required value={form.descricao} onChange={(e) => set('descricao', e.target.value)} style={inputStyle} />
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
