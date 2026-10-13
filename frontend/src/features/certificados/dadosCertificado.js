// Monta as frases do certificado (SE02) a partir da inscrição e do
// certificado emitido — compartilhado pela prévia na tela e pelo PDF.
export function formatarData(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function dadosCertificado({ nomeAluno, matricula, evento, certificado }) {
  const periodo = evento.horaFim ? `das ${evento.time} às ${evento.horaFim}` : `às ${evento.time}`;

  return {
    titulo: 'CERTIFICADO',
    texto:
      `Certificamos que ${nomeAluno}, matrícula ${matricula}, participou do evento ` +
      `${evento.title}, com palestrante ${evento.speaker || 'convidado'}, em ` +
      `${formatarData(evento.data) || evento.dateLabel}, ${periodo}, ` +
      `com carga horária de ${certificado.hours || evento.hours || '—'}.`,
    emitidoEm: `Emitido em ${new Date().toLocaleDateString('pt-BR')}`,
    codigo: `Código: ${certificado.codigo}`,
    assinatura: 'Assinatura da Reitoria'
  };
}
