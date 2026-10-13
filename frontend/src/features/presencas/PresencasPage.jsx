import { useMemo } from 'react';
import CrudPage from '../../components/CrudPage.jsx';
import { useOpcoes } from '../../hooks/useOpcoes.js';

const METODOS = [
  { value: 'Manual', label: 'Manual' },
  { value: 'QR Code', label: 'QR Code' },
  { value: 'NFC', label: 'NFC' }
];

// Porta de ConectaCampus.dc.html:388-436 (Validar presença / leitor de QR)
// como CRUD administrativo — a lista de check-ins do mockup vira registros
// editáveis de verdade, sobre a tabela presencas.
export default function PresencasPage() {
  const inscricoes = useOpcoes('inscricoes', (i) => `${i.alunoNome} · ${i.eventoTitulo}`);

  const campos = useMemo(
    () => [
      { nome: 'inscricaoId', label: 'Inscrição (aluno · evento)', tipo: 'select', opcoes: inscricoes, required: true, full: true },
      { nome: 'dataHora', label: 'Data/hora', tipo: 'text', placeholder: '19:04', required: true },
      { nome: 'metodo', label: 'Método', tipo: 'select', opcoes: METODOS, required: true },
      { nome: 'registradoPor', label: 'Registrado por', tipo: 'text', required: true }
    ],
    [inscricoes]
  );

  return (
    <CrudPage
      tipo="presencas"
      eyebrow="Centro acadêmico"
      titulo="Presenças"
      subtitulo="Confirmações de presença registradas — pré-requisito para gerar certificado."
      botaoNovoLabel="+ Nova presença"
      campos={campos}
    />
  );
}
