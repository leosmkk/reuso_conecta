import { useTenant } from '../context/TenantContext.jsx';
import { itensDeMenu, perfis } from '../navigation.js';

export default function Header({ screen, perfil, onNavigate, onBloqueado, onPerfil }) {
  const { nome, corPrimaria, modulosAtivos } = useTenant();
  const color = corPrimaria;
  const itens = itensDeMenu(perfil, modulosAtivos);

  return (
    <header
      style={{
        height: 72,
        background: color,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '0 22px 0 18px',
        color: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          background: '#fff',
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 800,
          flex: 'none'
        }}
      >
        C
      </div>

      <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>
        ConectaCampus
        <span style={{ fontWeight: 500, opacity: 0.75, fontSize: 13 }}> · {nome}</span>
      </div>

      <nav
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 2,
          height: 72,
          marginLeft: 8,
          flex: '1 1 auto',
          minWidth: 0,
          overflowX: 'auto'
        }}
      >
        {itens.map(({ id, label, locked }) => {
          const active = screen === id;
          return (
            <button
              key={id}
              onClick={() => (locked ? onBloqueado(label) : onNavigate(id))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                height: 72,
                padding: '0 16px',
                border: 'none',
                background: 'transparent',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                whiteSpace: 'nowrap',
                borderBottom: `3px solid ${active ? '#fff' : 'transparent'}`,
                opacity: active ? 1 : locked ? 0.62 : 0.82
              }}
            >
              {label}
              {locked && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              )}
            </button>
          );
        })}
      </nav>

      <select
        value={perfil}
        onChange={(e) => onPerfil(e.target.value)}
        style={{
          appearance: 'none',
          background: 'rgba(255,255,255,.15)',
          border: '1px solid rgba(255,255,255,.3)',
          color: '#fff',
          font: '600 12.5px Inter, sans-serif',
          padding: '9px 14px',
          borderRadius: 10,
          cursor: 'pointer',
          outline: 'none',
          flex: 'none'
        }}
      >
        {perfis.map(([id, label]) => (
          <option key={id} value={id} style={{ color: '#1B1A23' }}>
            {label}
          </option>
        ))}
      </select>
    </header>
  );
}
