import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(() => {
    const salvo = localStorage.getItem('sessao_hotel');
    return salvo ? JSON.parse(salvo) : null;
  });

  useEffect(() => {
    if (sessao) {
      localStorage.setItem('sessao_hotel', JSON.stringify(sessao));
    } else {
      localStorage.removeItem('sessao_hotel');
    }
  }, [sessao]);

  function entrar(token, usuario) {
    setSessao({ token, usuario });
  }

  function sair() {
    setSessao(null);
  }

  return (
    <AuthContext.Provider value={{ sessao, entrar, sair }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
