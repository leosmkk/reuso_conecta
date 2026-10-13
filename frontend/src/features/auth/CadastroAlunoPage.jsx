import { cadastrarAluno } from '../../services/api.js';
import { useSession } from '../../context/SessionContext.jsx';
import { Card, GhostButton } from '../../components/ui.jsx';
import FormularioCadastro from '../../components/FormularioCadastro.jsx';
import { cores, fonteTitulo } from '../../theme.js';
import TelaPublica from './TelaPublica.jsx';

const campos = [
  { nome: 'nome', label: 'Nome', full: true },
  { nome: 'nascimento', label: 'Data de nascimento', tipo: 'date' },
  { nome: 'matricula', label: 'Número da matrícula' },
  { nome: 'curso', label: 'Curso', full: true },
  { nome: 'email', label: 'E-mail institucional', tipo: 'email', full: true },
  { nome: 'senha', label: 'Senha', tipo: 'password', full: true }
];

// EE04 / RF05 — cadastro público de estudante. Ao concluir, entra direto
// com o usuário criado.
export default function CadastroAlunoPage({ onVoltar }) {
  const { entrar } = useSession();

  return (
    <TelaPublica>
      <div style={{ font: '600 12px Inter, sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', color: cores.eyebrow, marginBottom: 8 }}>
        Cadastro de estudante
      </div>
      <h1 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 34, letterSpacing: '-.03em', margin: '0 0 22px' }}>
        Criar minha conta
      </h1>

      <Card>
        <FormularioCadastro
          campos={campos}
          textoBotao="Cadastrar"
          aoEnviar={cadastrarAluno}
          aoConcluir={(resposta) => setTimeout(() => entrar(resposta.usuario), 900)}
        />
      </Card>

      <div style={{ marginTop: 18 }}>
        <GhostButton onClick={onVoltar} style={{ height: 40, fontSize: 13.5 }}>
          Voltar para o login
        </GhostButton>
      </div>
    </TelaPublica>
  );
}
