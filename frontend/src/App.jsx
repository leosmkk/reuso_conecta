import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import { TenantProvider, useTenant } from './context/TenantContext.jsx';
import { itensDeMenu, primeiraTelaDoPerfil, telaValidaNoPerfil } from './navigation.js';

import InicioPage from './features/inicio/InicioPage.jsx';
import AgendaPage from './features/eventos/AgendaPage.jsx';
import EventoDetalhe from './features/eventos/EventoDetalhe.jsx';
import CertificatesPage from './features/certificados/CertificatesPage.jsx';
import AlunosPage from './features/alunos/AlunosPage.jsx';
import InscricoesPage from './features/inscricoes/InscricoesPage.jsx';
import PresencasPage from './features/presencas/PresencasPage.jsx';
import CrachasPage from './features/crachas/CrachasPage.jsx';
import TenantsPage from './features/tenants/TenantsPage.jsx';
import ModulosPage from './features/modulos/ModulosPage.jsx';
import RelatoriosPage from './features/relatorios/RelatoriosPage.jsx';
import BloqueadoPage from './features/bloqueado/BloqueadoPage.jsx';

// Tabela telaId -> Componente, no lugar dos 11 `&&` encadeados que
// existiam quando só havia Agenda/Certificados.
const TELAS = {
  inicio: InicioPage,
  agenda: AgendaPage,
  certificados: CertificatesPage,
  alunos: AlunosPage,
  inscricoes: InscricoesPage,
  presencas: PresencasPage,
  crachas: CrachasPage,
  tenants: TenantsPage,
  modulos: ModulosPage,
  relatorios: RelatoriosPage
};

export default function App() {
  return (
    <TenantProvider>
      <AppShell />
    </TenantProvider>
  );
}

function AppShell() {
  const { modulosAtivos, loading: tenantLoading } = useTenant();
  const [perfil, setPerfil] = useState('aluno');
  const [screen, setScreen] = useState('inicio');
  const [eventoDetalheId, setEventoDetalheId] = useState(null);
  const [bloqueado, setBloqueado] = useState(null);

  // Se a troca de perfil (ou de tenant/módulo, via TenantContext) tornar a
  // tela atual inválida, volta para a primeira tela do menu — mesma regra
  // de onTenant/onRole do mockup (ConectaCampus.dc.html:829-846).
  useEffect(() => {
    if (tenantLoading) return;
    if (!telaValidaNoPerfil(screen, perfil, modulosAtivos)) {
      setScreen(primeiraTelaDoPerfil(perfil, modulosAtivos));
      setEventoDetalheId(null);
      setBloqueado(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil, modulosAtivos, tenantLoading]);

  function navegar(id) {
    setEventoDetalheId(null);
    setBloqueado(null);
    setScreen(id);
  }

  function trocarPerfil(novoPerfil) {
    setPerfil(novoPerfil);
    setEventoDetalheId(null);
    setBloqueado(null);
    setScreen(primeiraTelaDoPerfil(novoPerfil, modulosAtivos));
  }

  function abrirBloqueado(label) {
    setBloqueado(label);
  }

  function abrirDetalheEvento(id) {
    setEventoDetalheId(id);
    setBloqueado(null);
  }

  const itens = itensDeMenu(perfil, modulosAtivos);
  // aba "Agenda" continua ativa enquanto o Detalhe do evento está aberto
  // (mesma regra do mockup, ConectaCampus.dc.html:711).
  const screenAtiva = eventoDetalheId && itens.some((i) => i.id === 'agenda') ? 'agenda' : screen;

  const Tela = TELAS[screen];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        screen={bloqueado ? null : screenAtiva}
        perfil={perfil}
        onNavigate={navegar}
        onBloqueado={abrirBloqueado}
        onPerfil={trocarPerfil}
      />

      <main style={{ maxWidth: 1140, margin: '0 auto', padding: '34px 28px 72px' }}>
        {bloqueado ? (
          <BloqueadoPage label={bloqueado} onVoltar={() => setBloqueado(null)} />
        ) : eventoDetalheId ? (
          <EventoDetalhe eventoId={eventoDetalheId} onVoltar={() => setEventoDetalheId(null)} />
        ) : Tela ? (
          <Tela onAbrirDetalhe={abrirDetalheEvento} onIrParaAgenda={() => navegar('agenda')} />
        ) : null}
      </main>
    </div>
  );
}
