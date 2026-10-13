import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import { TenantProvider, useTenant } from './context/TenantContext.jsx';
import { SessionProvider, useSession } from './context/SessionContext.jsx';
import { itensDeMenu, primeiraTelaDoPerfil, telaValidaNoPerfil } from './navigation.js';

import LoginPage from './features/auth/LoginPage.jsx';
import CadastroAlunoPage from './features/auth/CadastroAlunoPage.jsx';
import InicioPage from './features/inicio/InicioPage.jsx';
import AgendaPage from './features/eventos/AgendaPage.jsx';
import EventoDetalhe from './features/eventos/EventoDetalhe.jsx';
import CertificatesPage from './features/certificados/CertificatesPage.jsx';
import MeusCertificadosPage from './features/certificados/MeusCertificadosPage.jsx';
import AlunosPage from './features/alunos/AlunosPage.jsx';
import InscricoesPage from './features/inscricoes/InscricoesPage.jsx';
import MinhasInscricoesPage from './features/inscricoes/MinhasInscricoesPage.jsx';
import PresencasPage from './features/presencas/PresencasPage.jsx';
import ValidarPresencaPage from './features/presencas/ValidarPresencaPage.jsx';
import CrachasPage from './features/crachas/CrachasPage.jsx';
import TenantsPage from './features/tenants/TenantsPage.jsx';
import ModulosPage from './features/modulos/ModulosPage.jsx';
import RelatoriosPage from './features/relatorios/RelatoriosPage.jsx';
import CentrosAcademicosPage from './features/cadastros/CentrosAcademicosPage.jsx';
import PalestrantesPage from './features/cadastros/PalestrantesPage.jsx';
import AprovacaoPage from './features/aprovacao/AprovacaoPage.jsx';
import MeusEventosPage from './features/palestrante/MeusEventosPage.jsx';
import ContaPage from './features/conta/ContaPage.jsx';
import BloqueadoPage from './features/bloqueado/BloqueadoPage.jsx';

// Tabela telaId -> Componente, no lugar dos 11 `&&` encadeados que
// existiam quando só havia Agenda/Certificados.
const TELAS = {
  inicio: InicioPage,
  agenda: AgendaPage,
  certificados: CertificatesPage,
  meusCertificados: MeusCertificadosPage,
  alunos: AlunosPage,
  inscricoes: InscricoesPage,
  minhasInscricoes: MinhasInscricoesPage,
  presencas: PresencasPage,
  validarPresenca: ValidarPresencaPage,
  crachas: CrachasPage,
  tenants: TenantsPage,
  modulos: ModulosPage,
  relatorios: RelatoriosPage,
  centros: CentrosAcademicosPage,
  palestrantes: PalestrantesPage,
  aprovacao: AprovacaoPage,
  meusEventos: MeusEventosPage,
  conta: ContaPage
};

export default function App() {
  return (
    <TenantProvider>
      <SessionProvider>
        <AppShell />
      </SessionProvider>
    </TenantProvider>
  );
}

function AppShell() {
  const { usuario } = useSession();
  const [publica, setPublica] = useState('login');

  if (!usuario) {
    return publica === 'cadastro' ? (
      <CadastroAlunoPage onVoltar={() => setPublica('login')} />
    ) : (
      <LoginPage onCadastro={() => setPublica('cadastro')} />
    );
  }

  return <AreaLogada key={usuario.id} />;
}

function AreaLogada() {
  const { usuario, sair } = useSession();
  const perfil = usuario.perfil;
  const { modulosAtivos, loading: tenantLoading } = useTenant();
  const [screen, setScreen] = useState(() => primeiraTelaDoPerfil(perfil, modulosAtivos));
  const [eventoDetalheId, setEventoDetalheId] = useState(null);
  const [bloqueado, setBloqueado] = useState(null);

  // Se a troca de tenant ou de módulo (Central de módulos) tornar a tela
  // atual inválida, volta para a primeira tela do menu — mesma regra de
  // onTenant/onRole do mockup (ConectaCampus.dc.html:829-846).
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
        usuario={usuario}
        onNavigate={navegar}
        onBloqueado={abrirBloqueado}
        onSair={sair}
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
