import { useTenant } from '../../context/TenantContext.jsx';
import { cores, fonteTitulo } from '../../theme.js';

// Porta de ConectaCampus.dc.html:613-625 — tela alcançada ao clicar num
// item de menu travado (locked) por falta de módulo contratado.
export default function BloqueadoPage({ label, onVoltar }) {
  const { nome } = useTenant();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 470,
          background: '#fff',
          borderRadius: 20,
          padding: '40px 36px',
          textAlign: 'center',
          boxShadow: '0 6px 20px rgba(27,26,35,.05)'
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            background: cores.inputFundo,
            color: cores.eyebrow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>

        <h2 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 21, margin: '0 0 10px' }}>
          Recurso não incluído neste plano
        </h2>

        <p style={{ fontSize: 14, color: cores.textoSecundario, lineHeight: 1.55, margin: '0 0 26px' }}>
          "{label}" não faz parte da contratação de {nome}. Fale com a administração da
          instituição para habilitar o módulo.
        </p>

        <button
          onClick={onVoltar}
          style={{
            height: 44,
            padding: '0 22px',
            border: `1px solid ${cores.borda}`,
            borderRadius: 13,
            background: '#fff',
            color: cores.textoTerciario,
            fontWeight: 600,
            fontSize: 14
          }}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
