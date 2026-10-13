import { useCallback, useEffect, useState } from 'react';
import { pesquisar } from '../services/api.js';
import { useTenant } from '../context/TenantContext.jsx';
import { Loading, ErrorMessage } from './Feedback.jsx';
import { Card, EmptyState, Modal, PageHeader, PrimaryButton } from './ui.jsx';
import FormularioCadastro from './FormularioCadastro.jsx';
import { cores, fonteTitulo } from '../theme.js';

/**
 * Lista somente leitura + botão que abre o formulário de cadastro numa
 * modal. É a forma das telas EE05 (centros acadêmicos) e EE06
 * (palestrantes), cujo cadastro passa por uma rota própria (cria também o
 * acesso do usuário) em vez do CRUD genérico.
 */
export default function ListaComCadastro({
  tipo,
  eyebrow,
  titulo,
  subtitulo,
  colunas,
  campos,
  aoEnviar,
  botaoLabel,
  tituloModal
}) {
  const { corPrimaria: brand } = useTenant();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aberto, setAberto] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setRegistros(await pesquisar(tipo));
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os dados pela API.');
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={titulo}
        subtitle={subtitulo}
        action={
          <PrimaryButton brand={brand} onClick={() => setAberto(true)}>
            {botaoLabel}
          </PrimaryButton>
        }
      />

      {loading && <Loading>Carregando...</Loading>}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && registros.length === 0 && (
        <Card>
          <EmptyState>Nenhum registro encontrado.</EmptyState>
        </Card>
      )}

      {!loading && !error && registros.length > 0 && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: cores.inputFundo }}>
                {colunas.map(([chave, rotulo]) => (
                  <th key={chave} style={thStyle}>
                    {rotulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro._id} style={{ borderTop: `1px solid ${cores.divisor}` }}>
                  {colunas.map(([chave]) => (
                    <td key={chave} style={tdStyle}>
                      {registro[chave] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {aberto && (
        <Modal onFechar={() => setAberto(false)} largura={680}>
          <h2 style={{ fontFamily: fonteTitulo, fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', margin: '0 0 26px' }}>
            {tituloModal}
          </h2>
          <FormularioCadastro
            campos={campos}
            textoBotao="Cadastrar"
            aoEnviar={aoEnviar}
            aoConcluir={carregar}
            aoCancelar={() => setAberto(false)}
          />
        </Modal>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '14px 20px',
  font: '600 11.5px Inter, sans-serif',
  color: cores.eyebrow,
  textTransform: 'uppercase',
  letterSpacing: '.06em'
};

const tdStyle = {
  padding: '14px 20px',
  fontSize: 13.5,
  color: cores.textoTerciario
};
