import { useState } from 'react';
import { ErrorMessage, SuccessMessage } from './Feedback.jsx';
import { Campo, GhostButton, PrimaryButton, inputStyle } from './ui.jsx';
import { useTenant } from '../context/TenantContext.jsx';

/**
 * Formulário dos cadastros EE04-EE06: campos obrigatórios, mensagem de erro
 * vinda da API (e-mail já usado etc.) e mensagem de sucesso. Cada tela só
 * descreve os `campos` e qual função de api.js chamar em `aoEnviar`.
 *
 * campo: { nome, label, tipo: 'text'|'password'|'email'|'date'|'textarea',
 *          placeholder, full }
 */
export default function FormularioCadastro({ campos, textoBotao, aoEnviar, aoConcluir, aoCancelar }) {
  const { corPrimaria: brand } = useTenant();
  const [form, setForm] = useState(() => Object.fromEntries(campos.map((c) => [c.nome, ''])));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function set(nome, valor) {
    setForm((atual) => ({ ...atual, [nome]: valor }));
  }

  async function submeter(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (campos.some((campo) => !String(form[campo.nome]).trim())) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setEnviando(true);
      const resposta = await aoEnviar(form);
      setSucesso(resposta.message);
      setForm(Object.fromEntries(campos.map((c) => [c.nome, ''])));
      aoConcluir?.(resposta);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={submeter} noValidate>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
        {campos.map((campo) => (
          <Campo key={campo.nome} label={campo.label} full={campo.full || campo.tipo === 'textarea'}>
            {campo.tipo === 'textarea' ? (
              <textarea
                rows={3}
                placeholder={campo.placeholder}
                value={form[campo.nome]}
                onChange={(e) => set(campo.nome, e.target.value)}
                style={{ ...inputStyle, height: 'auto', padding: '11px 13px', resize: 'vertical', lineHeight: 1.55 }}
              />
            ) : (
              <input
                type={campo.tipo || 'text'}
                placeholder={campo.placeholder}
                value={form[campo.nome]}
                onChange={(e) => set(campo.nome, e.target.value)}
                style={inputStyle}
              />
            )}
          </Campo>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        {erro && <ErrorMessage message={erro} />}
        {sucesso && <SuccessMessage message={sucesso} />}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
        <PrimaryButton type="submit" brand={brand} disabled={enviando}>
          {enviando ? 'Enviando...' : textoBotao}
        </PrimaryButton>
        {aoCancelar && (
          <GhostButton type="button" onClick={aoCancelar} style={{ height: 47, padding: '0 22px', fontSize: 14 }}>
            Fechar
          </GhostButton>
        )}
      </div>
    </form>
  );
}
