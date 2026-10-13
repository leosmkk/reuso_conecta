import { useEffect, useState } from 'react';
import { pesquisar } from '../../services/api.js';
import { useSession } from '../../context/SessionContext.jsx';
import { Loading } from '../../components/Feedback.jsx';
import { Card, GhostButton, PageHeader } from '../../components/ui.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import { cores } from '../../theme.js';

const ROTULO_PERFIL = {
  aluno: 'Aluno',
  centro: 'Centro acadêmico',
  universidade: 'Universidade',
  palestrante: 'Palestrante'
};

// Campos exibidos de cada perfil — [rótulo, chave do registro da API].
const CAMPOS = {
  aluno: ['alunos', 'alunoId', [['Nome completo', 'nome'], ['E-mail institucional', 'email'], ['Matrícula', 'matricula'], ['Curso', 'curso'], ['Data de nascimento', 'nascimento'], ['Telefone', 'telefone']]],
  centro: ['centros', 'centroAcademicoId', [['Nome do centro acadêmico', 'nome'], ['E-mail de contato', 'email'], ['Curso', 'curso'], ['Presidente', 'presidente'], ['Vice-presidente', 'vicePresidente'], ['Integrantes', 'integrantes']]],
  palestrante: ['palestrantes', 'palestranteId', [['Nome completo', 'nome'], ['E-mail', 'email'], ['Área de atuação', 'areaAtuacao']]],
  universidade: [null, null, []]
};

export default function ContaPage() {
  const { usuario, sair } = useSession();
  const { nome: tenantNome } = useTenant();
  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tipo, chaveVinculo, campos] = CAMPOS[usuario.perfil];

  useEffect(() => {
    if (!tipo || !usuario[chaveVinculo]) {
      setLoading(false);
      return;
    }
    pesquisar(tipo, usuario[chaveVinculo])
      .then(setRegistro)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [tipo, chaveVinculo, usuario]);

  const iniciais = usuario.nome
    .split(' ')
    .filter((p) => /^\p{L}/u.test(p))
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const linhas = registro
    ? campos.map(([rotulo, chave]) => [rotulo, registro[chave]])
    : [['Nome', usuario.nome], ['E-mail', usuario.email]];

  return (
    <div>
      <PageHeader eyebrow={ROTULO_PERFIL[usuario.perfil]} title="Minha conta" />

      {loading ? (
        <Loading>Carregando...</Loading>
      ) : (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--tc, #0F8A6B)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                font: '800 22px Manrope, sans-serif'
              }}
            >
              {iniciais}
            </div>
            <div>
              <div style={{ font: '700 20px Manrope, sans-serif' }}>{usuario.nome}</div>
              <div style={{ fontSize: 13.5, color: cores.textoSecundario }}>
                {ROTULO_PERFIL[usuario.perfil]} · {tenantNome}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <GhostButton onClick={sair}>Sair</GhostButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
            {linhas.map(([rotulo, valor]) => (
              <div key={rotulo}>
                <div style={{ font: '600 11.5px Inter, sans-serif', color: cores.eyebrow, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
                  {rotulo}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{valor || '—'}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
