import CrudPage from '../../components/CrudPage.jsx';

const campos = [
  { nome: 'chave', label: 'Chave (usada no .env TENANT=)', tipo: 'text', required: true },
  { nome: 'nome', label: 'Nome da instituição', tipo: 'text', required: true },
  { nome: 'corPrimaria', label: 'Cor primária (hex)', tipo: 'text', placeholder: '#6D28D9', required: true }
];

// Porta do seletor de tenant do header do mockup (ConectaCampus.dc.html:59-63)
// como CRUD administrativo — cada linha é um cliente whitelabel da LPS.
// A cor/nome só "pega" de verdade quando TENANT no .env aponta pra essa
// chave (VariabilityConfig::getTenant()); ver Central de módulos para
// ligar/desligar os módulos de cada um.
export default function TenantsPage() {
  return (
    <CrudPage
      tipo="tenants"
      eyebrow="Universidade"
      titulo="Instituições"
      subtitulo="Clientes whitelabel da LPS — cor e nome exibidos conforme TENANT no .env."
      botaoNovoLabel="+ Nova instituição"
      campos={campos}
    />
  );
}
