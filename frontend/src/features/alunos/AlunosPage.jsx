import CrudPage from '../../components/CrudPage.jsx';

const campos = [
  { nome: 'nome', label: 'Nome completo', tipo: 'text', required: true, full: true },
  { nome: 'email', label: 'E-mail institucional', tipo: 'text', required: true },
  { nome: 'matricula', label: 'Matrícula', tipo: 'text', required: true },
  { nome: 'telefone', label: 'Telefone', tipo: 'text' },
  { nome: 'curso', label: 'Curso', tipo: 'text' },
  { nome: 'semestre', label: 'Semestre', tipo: 'number' }
];

// Porta de ConectaCampus.dc.html:113-147 (Cadastro de aluno) e :582-611
// (Minha conta, perfil aluno) — aqui como CRUD administrativo completo.
export default function AlunosPage() {
  return (
    <CrudPage
      tipo="alunos"
      eyebrow="Centro acadêmico"
      titulo="Alunos"
      subtitulo="Cadastro dos alunos vinculados à instituição."
      botaoNovoLabel="+ Novo aluno"
      campos={campos}
    />
  );
}
