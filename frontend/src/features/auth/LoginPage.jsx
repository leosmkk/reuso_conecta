import { useState } from 'react';
import { login } from '../../services/api.js';
import { useSession } from '../../context/SessionContext.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import { ErrorMessage } from '../../components/Feedback.jsx';
import { Card, Campo, GhostButton, PrimaryButton, inputStyle } from '../../components/ui.jsx';
import { cores, fonteTitulo } from '../../theme.js';
import TelaPublica from './TelaPublica.jsx';

// Contas criadas por database/seeders/UsuarioSeeder.php (senha senha123)
// — atalhos para a equipe navegar por cada perfil sem digitar.
const CONTAS_DEMO = [
  ['Aluno', 'joao.silva@valeverde.edu'],
  ['Centro acadêmico', 'ca.computacao@campus.edu'],
  ['Universidade', 'reitoria@campus.edu'],
  ['Palestrante', 'helena.coutinho@externo.org']
];

export default function LoginPage({ onCadastro }) {
  const { corPrimaria: brand, nome } = useTenant();
  const { entrar } = useSession();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function acessar(emailAcesso, senhaAcesso) {
    try {
      setEnviando(true);
      setErro('');
      const resposta = await login(emailAcesso, senhaAcesso);
      entrar(resposta.usuario);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function submeter(e) {
    e.preventDefault();
    acessar(email, senha);
  }

  return (
    <TelaPublica>
      <div style={{ font: '600 12px Inter, sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', color: cores.eyebrow, marginBottom: 8 }}>
        {nome}
      </div>
      <h1 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 34, letterSpacing: '-.03em', margin: '0 0 8px' }}>
        Entrar no ConectaCampus
      </h1>
      <p style={{ color: cores.textoSecundario, margin: '0 0 26px' }}>
        Toda a vida acadêmica de eventos em um só lugar.
      </p>

      <Card>
        <form onSubmit={submeter} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Campo label="E-mail institucional">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </Campo>
          <Campo label="Senha">
            <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} style={inputStyle} />
          </Campo>

          {erro && <ErrorMessage message={erro} />}

          <PrimaryButton type="submit" brand={brand} disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </PrimaryButton>
          <GhostButton type="button" onClick={onCadastro} style={{ height: 44, fontSize: 13.5 }}>
            Criar minha conta
          </GhostButton>
        </form>
      </Card>

      <div style={{ marginTop: 22 }}>
        <div style={{ font: '600 11.5px Inter, sans-serif', color: cores.eyebrow, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
          Entrar como (contas de demonstração)
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CONTAS_DEMO.map(([rotulo, emailDemo]) => (
            <GhostButton key={emailDemo} disabled={enviando} onClick={() => acessar(emailDemo, 'senha123')}>
              {rotulo}
            </GhostButton>
          ))}
        </div>
      </div>
    </TelaPublica>
  );
}
