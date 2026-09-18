export default function Header({ screen, onNavigate }) {
  const color = '#0F8A6B';

  return (
    <header
      style={{
        height: 72,
        background: color,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 24px',
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
          fontWeight: 800
        }}
      >
        C
      </div>

      <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
        ConectaCampus
      </div>

      <nav style={{ display: 'flex', height: 72, marginLeft: 24 }}>
        {[
          ['agenda', 'Agenda'],
          ['certificados', 'Certificados']
        ].map(([id, label]) => {
          const active = screen === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                height: 72,
                padding: '0 18px',
                border: 'none',
                background: 'transparent',
                color: '#fff',
                fontWeight: 600,
                borderBottom: `3px solid ${active ? '#fff' : 'transparent'}`,
                opacity: active ? 1 : .78
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
