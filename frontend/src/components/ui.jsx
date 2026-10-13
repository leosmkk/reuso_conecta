import { cores, raios, alturas, sombraCard, fonteTitulo } from '../theme.js';

export const eyebrowStyle = {
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: cores.eyebrow,
  marginBottom: 8
};

export const titleStyle = {
  fontFamily: fonteTitulo,
  fontWeight: 800,
  fontSize: 34,
  letterSpacing: '-.03em',
  margin: '0 0 22px'
};

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: subtitle ? 0 : 22 }}>
      <div style={eyebrowStyle}>{eyebrow}</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20
        }}
      >
        <h1 style={titleStyle}>{title}</h1>
        {action}
      </div>
      {subtitle && (
        <p style={{ color: cores.textoSecundario, margin: '-10px 0 22px' }}>{subtitle}</p>
      )}
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div
      style={{
        background: cores.card,
        borderRadius: raios.card,
        padding: 24,
        boxShadow: sombraCard,
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({ children, brand, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        height: alturas.botaoPrimario,
        padding: '0 22px',
        border: 'none',
        borderRadius: raios.botaoGrande,
        background: brand || cores.verdeMarca,
        color: '#fff',
        fontWeight: 700,
        fontSize: 14.5,
        opacity: props.disabled ? 0.7 : 1,
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        height: alturas.botaoPequeno,
        padding: '0 14px',
        borderRadius: raios.botaoPequeno,
        border: `1px solid ${cores.borda}`,
        background: '#fff',
        color: cores.textoTerciario,
        fontWeight: 600,
        fontSize: 13,
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function DangerButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        height: alturas.botaoPequeno,
        padding: '0 14px',
        borderRadius: raios.botaoPequeno,
        border: 'none',
        background: cores.perigo,
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function DangerGhostButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        height: alturas.botaoPequeno,
        padding: '0 14px',
        borderRadius: raios.botaoPequeno,
        border: `1px solid ${cores.perigoBorda}`,
        background: '#fff',
        color: cores.perigo,
        fontWeight: 600,
        fontSize: 13,
        ...style
      }}
    >
      {children}
    </button>
  );
}

export const inputStyle = {
  width: '100%',
  height: alturas.input,
  border: `1px solid ${cores.borda}`,
  borderRadius: raios.input,
  padding: '0 13px',
  fontSize: 14,
  background: cores.inputFundo,
  color: cores.texto,
  outline: 'none'
};

export const labelStyle = {
  display: 'block',
  font: '600 12px Inter, sans-serif',
  color: cores.textoTerciario,
  marginBottom: 7
};

export function Campo({ label, full, children }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export function Modal({ children, onFechar, largura = 620 }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27,26,35,.45)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '48px 20px',
        overflowY: 'auto',
        zIndex: 50
      }}
      onClick={onFechar}
    >
      <div
        style={{
          width: '100%',
          maxWidth: largura,
          background: '#fff',
          borderRadius: raios.card,
          padding: 32,
          boxShadow: '0 20px 60px rgba(27,26,35,.22)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

const STATUS_PADRAO = {
  inscrito: [cores.verdeMarca, 'rgba(15,138,107,.1)', 'Inscrito'],
  vagas: [cores.textoTerciario, 'rgba(74,72,87,.08)', 'Vagas abertas'],
  lotado: [cores.perigo, 'rgba(180,35,75,.1)', 'Lotado'],
  confirmado: [cores.verdeMarca, 'rgba(15,138,107,.1)', 'Confirmado'],
  aguardando: [cores.textoTerciario, 'rgba(74,72,87,.08)', 'Aguardando'],
  disponivel: [cores.textoTerciario, 'rgba(74,72,87,.08)', 'Disponível'],
  aguardando_reitoria: [cores.textoTerciario, 'rgba(74,72,87,.08)', 'Aguardando Reitoria'],
  assinado: [cores.verdeMarca, 'rgba(15,138,107,.1)', 'Assinado'],
  ativo: [cores.verdeMarca, 'rgba(15,138,107,.1)', 'Ativo'],
  inativo: [cores.eyebrow, 'rgba(139,136,160,.12)', 'Inativo']
};

export function StatusBadge({ status, mapa }) {
  const tabela = mapa || STATUS_PADRAO;
  const [color, background, label] = tabela[status] || [cores.textoTerciario, 'rgba(74,72,87,.08)', status];

  return (
    <div
      style={{
        fontWeight: 700,
        fontSize: 11.5,
        color,
        background,
        padding: '6px 11px',
        borderRadius: 9,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: cores.textoSecundario }}>
      {children}
    </div>
  );
}
