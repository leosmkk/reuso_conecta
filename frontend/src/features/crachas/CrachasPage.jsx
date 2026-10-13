import { useMemo } from 'react';
import CrudPage from '../../components/CrudPage.jsx';
import { useOpcoes } from '../../hooks/useOpcoes.js';

// Suporte ao check-in por NFC (App\Patterns\Strategy\NfcCheckIn) — o
// mockup não tem tela própria de crachás, mas o CheckInController já lê
// esta tabela quando CHECKIN_METHOD=nfc.
export default function CrachasPage() {
  const alunos = useOpcoes('alunos', (a) => `${a.nome} (${a.matricula})`);

  const campos = useMemo(
    () => [
      { nome: 'idCracha', label: 'ID do crachá', tipo: 'text', placeholder: 'NFC-001', required: true },
      { nome: 'alunoId', label: 'Aluno', tipo: 'select', opcoes: alunos, required: true, coluna: false },
      { nome: 'alunoNome', label: 'Aluno', tipo: 'text', somenteLeitura: true },
      { nome: 'ativo', label: 'Ativo', tipo: 'checkbox' }
    ],
    [alunos]
  );

  return (
    <CrudPage
      tipo="crachas"
      eyebrow="Centro acadêmico"
      titulo="Crachás"
      subtitulo="Crachás NFC vinculados a alunos, usados pela estratégia de check-in NfcCheckIn."
      botaoNovoLabel="+ Novo crachá"
      campos={campos}
    />
  );
}
