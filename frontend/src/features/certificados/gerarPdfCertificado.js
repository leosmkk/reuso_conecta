import { jsPDF } from 'jspdf';
import { dadosCertificado } from './dadosCertificado.js';

// "Baixar PDF" (SE02 / RF35-RF36): certificado em A4 paisagem, gerado no
// navegador com os mesmos textos da prévia.
export function gerarPdfCertificado(dados, corPrimaria = '#0F8A6B') {
  const { titulo, texto, emitidoEm, codigo, assinatura } = dadosCertificado(dados);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(corPrimaria.slice(i, i + 2), 16));

  doc.setDrawColor(r, g, b);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, largura - 20, altura - 20);

  doc.setTextColor(r, g, b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.text(titulo, largura / 2, 50, { align: 'center', charSpace: 2 });

  doc.setTextColor(27, 26, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text(doc.splitTextToSize(texto, largura - 70), largura / 2, 80, { align: 'center', lineHeightFactor: 1.8 });

  doc.setFontSize(11);
  doc.setTextColor(107, 104, 128);
  doc.text(emitidoEm, 30, altura - 30);
  doc.text(codigo, largura - 30, altura - 30, { align: 'right' });

  doc.setTextColor(27, 26, 35);
  doc.setFont('times', 'italic');
  doc.setFontSize(22);
  doc.text('Reitoria', largura / 2, altura - 42, { align: 'center' });
  doc.setDrawColor(150);
  doc.setLineWidth(0.3);
  doc.line(largura / 2 - 35, altura - 38, largura / 2 + 35, altura - 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(107, 104, 128);
  doc.text(assinatura, largura / 2, altura - 32, { align: 'center' });

  doc.save(`certificado-${dados.certificado.codigo}.pdf`);
}
