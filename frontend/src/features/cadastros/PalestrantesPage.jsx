import ListaComCadastro from '../../components/ListaComCadastro.jsx';
import { cadastrarPalestrante } from '../../services/api.js';

const colunas = [
  ['nome', 'Nome'],
  ['email', 'E-mail'],
  ['areaAtuacao', 'Área de atuação']
];

const campos = [
  { nome: 'nome', label: 'Nome' },
  { nome: 'email', label: 'E-mail', tipo: 'email' },
  { nome: 'senha', label: 'Senha', tipo: 'password' },
  { nome: 'areaAtuacao', label: 'Área de atuação' }
];

// EE06 / RF07 — cadastro feito somente pelo perfil Centro Acadêmico.
export default function PalestrantesPage() {
  return (
    <ListaComCadastro
      tipo="palestrantes"
      eyebrow="Centro acadêmico"
      titulo="Palestrantes"
      subtitulo="Cadastro feito somente pelo perfil Centro Acadêmico (RF07)."
      colunas={colunas}
      campos={campos}
      aoEnviar={cadastrarPalestrante}
      botaoLabel="+ Cadastrar palestrante"
      tituloModal="Cadastrar palestrante"
    />
  );
}
