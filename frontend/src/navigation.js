// Porta de conectacampus/legacy/ConectaCampus.dc.html:662-667 (navDefs).
// Cada entrada é [telaId, label, moduloDependente?, 'hide'?] — mesma
// semântica do mockup:
//   - sem 'hide': o item aparece com cadeado (travado) quando o tenant
//     ativo não tem o módulo; clicar leva à tela Bloqueado.
//   - com 'hide': o item some do menu quando o módulo está desligado.
export const navDefs = {
  aluno: [
    ['inicio', 'Início'],
    ['agenda', 'Agenda'],
    ['minhasInscricoes', 'Minhas inscrições'],
    ['meusCertificados', 'Certificados'],
    ['conta', 'Minha conta']
  ],
  centro: [
    ['agenda', 'Agenda'],
    ['alunos', 'Alunos'],
    ['palestrantes', 'Palestrantes'],
    ['inscricoes', 'Inscrições'],
    ['validarPresenca', 'Validar presença', 'qrcode'],
    ['presencas', 'Presenças'],
    ['crachas', 'Crachás'],
    ['relatorios', 'Relatórios'],
    ['conta', 'Minha conta']
  ],
  universidade: [
    ['relatorios', 'Relatórios'],
    ['centros', 'Centros acadêmicos'],
    ['aprovacao', 'Aprovação', 'dualSignature', 'hide'],
    ['certificados', 'Certificados', 'dualSignature', 'hide'],
    ['modulos', 'Central de módulos'],
    ['tenants', 'Instituições'],
    ['conta', 'Minha conta']
  ],
  palestrante: [
    ['meusEventos', 'Meus eventos'],
    ['agenda', 'Agenda'],
    ['conta', 'Minha conta']
  ]
};

export const perfis = [
  ['aluno', 'Aluno'],
  ['centro', 'Centro Acadêmico'],
  ['universidade', 'Universidade'],
  ['palestrante', 'Palestrante']
];

/**
 * Monta os itens de menu do perfil, já filtrando os que usam modo 'hide'
 * e marcando `locked` para os que dependem de um módulo desligado —
 * mesma lógica de renderVals() (ConectaCampus.dc.html:708-717).
 */
export function itensDeMenu(perfil, modulosAtivos) {
  const defs = navDefs[perfil] || [];

  return defs
    .filter(([, , modulo, modo]) => !(modo === 'hide' && modulo && !modulosAtivos.includes(modulo)))
    .map(([id, label, modulo]) => ({
      id,
      label,
      locked: Boolean(modulo) && !modulosAtivos.includes(modulo),
      moduloRequerido: modulo
    }));
}

/**
 * Primeira tela válida do perfil dado o conjunto de módulos ativos —
 * usada para redirecionar quando a tela atual deixa de existir no menu
 * (troca de perfil ou de tenant).
 */
export function primeiraTelaDoPerfil(perfil, modulosAtivos) {
  const itens = itensDeMenu(perfil, modulosAtivos);
  return itens[0]?.id || 'inicio';
}

export function telaValidaNoPerfil(telaId, perfil, modulosAtivos) {
  return itensDeMenu(perfil, modulosAtivos).some((item) => item.id === telaId && !item.locked);
}
