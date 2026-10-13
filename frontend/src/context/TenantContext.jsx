import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { buscarTenantAtivo } from '../services/api.js';

// Cor/nome usados enquanto a API não responde (ou se falhar) — o app
// nunca fica sem marca, só sem a marca "certa" por um instante.
const PADRAO = { id: null, chave: null, nome: 'ConectaCampus', corPrimaria: '#0F8A6B', modulosAtivos: [] };

const TenantContext = createContext({ ...PADRAO, loading: true, recarregar: () => {} });

// Busca o tenant ativo (App\Patterns\Singleton\VariabilityConfig::getTenant()
// no backend) e distribui a marca (nome + cor + módulos) pra quem precisar,
// sem prop drilling. Além do fetch inicial, expõe recarregar() — a Central
// de Módulos chama depois de alternarModulo() pra o menu (gateado por
// modulosAtivos) reagir ao toggle sem precisar de F5.
export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState({ ...PADRAO, loading: true });

  const carregar = useCallback(async () => {
    try {
      const dados = await buscarTenantAtivo();
      setTenant({ ...dados, loading: false });
    } catch (err) {
      console.error('Não foi possível carregar o tenant ativo:', err);
      setTenant({ ...PADRAO, loading: false });
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <TenantContext.Provider value={{ ...tenant, recarregar: carregar }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
