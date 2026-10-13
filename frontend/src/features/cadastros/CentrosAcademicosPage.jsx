import ListaComCadastro from '../../components/ListaComCadastro.jsx';
import { cadastrarCentro } from '../../services/api.js';

const colunas = [
  ['nome', 'Nome'],
  ['curso', 'Curso'],
  ['email', 'E-mail'],
  ['presidente', 'Presidente'],
  ['vicePresidente', 'Vice-presidente']
];

const campos = [
  { nome: 'nome', label: 'Nome' },
  { nome: 'curso', label: 'Curso' },
  { nome: 'email', label: 'E-mail', tipo: 'email' },
  { nome: 'senha', label: 'Senha', tipo: 'password' },
  { nome: 'presidente', label: 'Presidente' },
  { nome: 'vicePresidente', label: 'Vice-presidente' },
  { nome: 'integrantes', label: 'Integrantes', tipo: 'textarea', placeholder: 'Diego, Laura, Otávio, Anna …' }
];

// EE05 / RF06 — cadastro feito somente pelo perfil Universidade.
export default function CentrosAcademicosPage() {
  return (
    <ListaComCadastro
      tipo="centros"
      eyebrow="Universidade"
      titulo="Centros acadêmicos"
      subtitulo="Cadastro feito somente pelo perfil Universidade (RF06)."
      colunas={colunas}
      campos={campos}
      aoEnviar={cadastrarCentro}
      botaoLabel="+ Cadastrar Centro Acadêmico"
      tituloModal="Cadastrar Centro Acadêmico"
    />
  );
}
