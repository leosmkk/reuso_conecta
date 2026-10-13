import { useMemo, useState } from 'react';
import { useCrud } from '../hooks/useCrud.js';
import { useTenant } from '../context/TenantContext.jsx';
import { Loading, ErrorMessage, SuccessMessage } from './Feedback.jsx';
import {
  PageHeader,
  Card,
  PrimaryButton,
  GhostButton,
  DangerButton,
  DangerGhostButton,
  Modal,
  Campo,
  inputStyle,
  EmptyState
} from './ui.jsx';
import { cores } from '../theme.js';

/**
 * Página CRUD genérica dirigida por um descritor de campos — a mesma
 * espinha de AgendaPage.jsx/EventoForm.jsx (useCrud + tabela + modal),
 * generalizada para não reescrever ~200 linhas por tela. Cada uma das
 * telas simples (Alunos, Inscrições, Presenças, Crachás, Instituições)
 * é só uma lista de `campos` sobre este componente; Agenda e Certificados
 * continuam com layout próprio porque precisam de mais que uma tabela.
 *
 * campo: { nome, label, tipo: 'text'|'number'|'select'|'textarea'|'checkbox',
 *          opcoes, required, full, somenteLeitura, modulo, coluna, valorPadrao }
 */
export default function CrudPage({
  tipo,
  eyebrow,
  titulo,
  subtitulo,
  campos,
  botaoNovoLabel = '+ Novo registro',
  idDe = (registro) => registro._id
}) {
  const { corPrimaria: brand, modulosAtivos } = useTenant();
  const crud = useCrud(tipo, { idDe });

  const camposVisiveis = useMemo(
    () => campos.filter((campo) => !campo.modulo || modulosAtivos.includes(campo.modulo)),
    [campos, modulosAtivos]
  );

  const colunas = useMemo(
    () => camposVisiveis.filter((campo) => campo.coluna !== false && campo.tipo !== 'textarea'),
    [camposVisiveis]
  );

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={titulo}
        subtitle={subtitulo}
        action={
          <PrimaryButton brand={brand} onClick={crud.abrirNovo}>
            {botaoNovoLabel}
          </PrimaryButton>
        }
      />

      {crud.aviso && <SuccessMessage message={crud.aviso} />}
      {crud.loading && <Loading>Carregando...</Loading>}
      {crud.error && <ErrorMessage message={crud.error} />}

      {!crud.loading && !crud.error && crud.registros.length === 0 && (
        <Card>
          <EmptyState>Nenhum registro encontrado.</EmptyState>
        </Card>
      )}

      {!crud.loading && !crud.error && crud.registros.length > 0 && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: cores.inputFundo }}>
                {colunas.map((campo) => (
                  <th key={campo.nome} style={thStyle}>
                    {campo.label}
                  </th>
                ))}
                <th style={{ ...thStyle, textAlign: 'right' }} />
              </tr>
            </thead>
            <tbody>
              {crud.registros.map((registro) => {
                const id = idDe(registro);
                return (
                  <tr key={id} style={{ borderTop: `1px solid ${cores.divisor}` }}>
                    {colunas.map((campo) => (
                      <td key={campo.nome} style={tdStyle}>
                        {formatarValor(registro[campo.nome], campo)}
                      </td>
                    ))}
                    <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {crud.confirmarId === id ? (
                        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12.5, color: cores.perigo, fontWeight: 600 }}>
                            Excluir?
                          </span>
                          <DangerButton
                            onClick={() => crud.remover(id)}
                            disabled={crud.excluindoId === id}
                          >
                            {crud.excluindoId === id ? 'Excluindo...' : 'Confirmar'}
                          </DangerButton>
                          <GhostButton onClick={() => crud.setConfirmarId(null)}>
                            Cancelar
                          </GhostButton>
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', gap: 8 }}>
                          <GhostButton onClick={() => crud.abrirEdicao(registro)}>
                            Editar
                          </GhostButton>
                          <DangerGhostButton onClick={() => crud.setConfirmarId(id)}>
                            Excluir
                          </DangerGhostButton>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {crud.formAberto && (
        <CrudForm
          campos={camposVisiveis}
          registro={crud.emEdicao}
          salvando={crud.salvando}
          brand={brand}
          onSalvar={crud.salvar}
          onCancelar={crud.fecharForm}
        />
      )}
    </div>
  );
}

function formatarValor(valor, campo) {
  if (campo.tipo === 'checkbox') {
    return valor ? 'Sim' : 'Não';
  }
  if (campo.tipo === 'select' && campo.opcoes) {
    const opcao = campo.opcoes.find((o) => o.value === valor);
    return opcao ? opcao.label : (valor ?? '—');
  }
  return valor ?? '—';
}

function CrudForm({ campos, registro, salvando, brand, onSalvar, onCancelar }) {
  const editando = Boolean(registro);

  const [form, setForm] = useState(() => {
    const inicial = {};
    campos.forEach((campo) => {
      if (campo.somenteLeitura) return;
      const valorAtual = registro ? registro[campo.nome] : undefined;
      inicial[campo.nome] = valorAtual ?? campo.valorPadrao ?? (campo.tipo === 'checkbox' ? false : campo.tipo === 'number' ? 0 : '');
    });
    return inicial;
  });

  function set(nome, valor) {
    setForm((atual) => ({ ...atual, [nome]: valor }));
  }

  function submeter(e) {
    e.preventDefault();

    const dados = { ...form };
    campos.forEach((campo) => {
      if (campo.tipo === 'number') {
        dados[campo.nome] = Number(dados[campo.nome]) || 0;
      }
    });

    onSalvar(dados);
  }

  return (
    <Modal onFechar={onCancelar}>
      <form onSubmit={submeter}>
        <h2
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: '-.02em',
            margin: '0 0 26px'
          }}
        >
          {editando ? 'Editar registro' : 'Cadastrar registro'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          {campos
            .filter((campo) => !campo.somenteLeitura)
            .map((campo) => (
              <Campo key={campo.nome} label={campo.label} full={campo.full || campo.tipo === 'textarea'}>
                <CampoInput campo={campo} valor={form[campo.nome]} aoMudar={(v) => set(campo.nome, v)} />
              </Campo>
            ))}
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

function CampoInput({ campo, valor, aoMudar }) {
  if (campo.tipo === 'select') {
    return (
      <select
        required={campo.required}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        style={inputStyle}
      >
        <option value="" disabled>
          Selecione...
        </option>
        {(campo.opcoes || []).map((opcao) => (
          <option key={opcao.value} value={opcao.value}>
            {opcao.label}
          </option>
        ))}
      </select>
    );
  }

  if (campo.tipo === 'textarea') {
    return (
      <textarea
        required={campo.required}
        rows={3}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        style={{ ...inputStyle, height: 'auto', padding: '11px 13px', resize: 'vertical', lineHeight: 1.55 }}
      />
    );
  }

  if (campo.tipo === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={Boolean(valor)}
        onChange={(e) => aoMudar(e.target.checked)}
        style={{ width: 18, height: 18, marginTop: 12 }}
      />
    );
  }

  return (
    <input
      type={campo.tipo === 'number' ? 'number' : 'text'}
      required={campo.required}
      placeholder={campo.placeholder}
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      style={inputStyle}
    />
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '14px 20px',
  font: '600 11.5px Inter, sans-serif',
  color: cores.eyebrow,
  textTransform: 'uppercase',
  letterSpacing: '.06em'
};

const tdStyle = {
  padding: '14px 20px',
  fontSize: 13.5,
  color: cores.textoTerciario
};
