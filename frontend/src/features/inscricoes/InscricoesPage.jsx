import { useMemo } from 'react';
import CrudPage from '../../components/CrudPage.jsx';
import { useOpcoes } from '../../hooks/useOpcoes.js';

// Porta de ConectaCampus.dc.html:253-309 (botão "Confirmar inscrição" do
// Detalhe do evento) como CRUD administrativo — o centro acadêmico
// inscreve/edita/remove inscrições diretamente.
export default function InscricoesPage() {
  const alunos = useOpcoes('alunos', (a) => `${a.nome} (${a.matricula})`);
  const eventos = useOpcoes('eventos', (e) => e.title);

  const campos = useMemo(
    () => [
      { nome: 'alunoId', label: 'Aluno', tipo: 'select', opcoes: alunos, required: true, coluna: false },
      { nome: 'alunoNome', label: 'Aluno', tipo: 'text', somenteLeitura: true },
      { nome: 'eventoId', label: 'Evento', tipo: 'select', opcoes: eventos, required: true, coluna: false },
      { nome: 'eventoTitulo', label: 'Evento', tipo: 'text', somenteLeitura: true },
      { nome: 'dataInscricao', label: 'Data da inscrição', tipo: 'text', placeholder: 'AAAA-MM-DD', required: true },
      { nome: 'token', label: 'Token', tipo: 'text', placeholder: 'Ex.: 8F9D3BBB', required: true }
    ],
    [alunos, eventos]
  );

  return (
    <CrudPage
      tipo="inscricoes"
      eyebrow="Centro acadêmico"
      titulo="Inscrições"
      subtitulo="Vincula alunos a eventos — o que alimenta presença e certificado."
      botaoNovoLabel="+ Nova inscrição"
      campos={campos}
    />
  );
}
