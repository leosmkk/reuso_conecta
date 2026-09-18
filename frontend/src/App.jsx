import { useState } from 'react';
import Header from './components/Header.jsx';
import AgendaPage from './features/eventos/AgendaPage.jsx';
import CertificatesPage from './features/certificados/CertificatesPage.jsx';

export default function App() {
  const [screen, setScreen] = useState('agenda');

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header screen={screen} onNavigate={setScreen} />

      <main
        style={{
          maxWidth: 1140,
          margin: '0 auto',
          padding: '34px 28px 72px'
        }}
      >
        {screen === 'agenda' && <AgendaPage />}
        {screen === 'certificados' && <CertificatesPage />}
      </main>
    </div>
  );
}
