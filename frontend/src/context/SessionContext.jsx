import { createContext, useCallback, useContext, useState } from 'react';

const CHAVE = 'conectacampus.sessao';

function lerSessao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || null;
  } catch {
    return null;
  }
}

const SessionContext = createContext({ usuario: null, entrar: () => {}, sair: () => {} });

// Usuário logado (perfil + vínculos com aluno/centro/palestrante). A API
// não emite token — o contrato do login devolve o usuário e ele fica no
// localStorage, igual ao escopo acadêmico descrito no CLAUDE.md.
export function SessionProvider({ children }) {
  const [usuario, setUsuario] = useState(lerSessao);

  const entrar = useCallback((dados) => {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
    setUsuario(dados);
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE);
    setUsuario(null);
  }, []);

  return (
    <SessionContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
