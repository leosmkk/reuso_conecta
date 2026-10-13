import { useTenant } from '../../context/TenantContext.jsx';

// Moldura das telas sem sessão (login e cadastro): faixa com a marca do
// tenant ativo e conteúdo centralizado, sem o menu por perfil.
export default function TelaPublica({ children }) {
  const { nome, corPrimaria: brand } = useTenant();

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ height: 72, background: brand, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', color: '#fff' }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            background: '#fff',
            color: brand,
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
          <span style={{ fontWeight: 500, opacity: 0.75, fontSize: 13 }}> · {nome}</span>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 72px' }}>{children}</main>
    </div>
  );
}
