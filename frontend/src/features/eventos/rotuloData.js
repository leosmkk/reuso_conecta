const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

// "2026-09-12" -> "12 de setembro": o rótulo que a agenda e o detalhe do
// evento mostram, derivado da data estruturada.
export function rotuloData(iso) {
  if (!iso) return '';
  const [, mes, dia] = iso.split('-');
  return `${Number(dia)} de ${MESES[Number(mes) - 1]}`;
}
