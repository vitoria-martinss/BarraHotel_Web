import { createContext, useContext, useState, ReactNode } from "react";
import { type Guest, type Employee } from "./data";

export type Page =
  // Páginas públicas
  | { id: 'home' }
  | { id: 'rooms' }
  | { id: 'room-detail'; roomId: string }
  | { id: 'services' }
  | { id: 'about' }
  | { id: 'contact' }

  // Autenticação
  | { id: 'login' }
  | { id: 'register' }
  | { id: 'forgot-password' }

  // Área do hóspede
  | { id: 'booking'; step?: number; roomId?: string }
  | { id: 'my-reservations' }
  | { id: 'guest-profile' }
  | { id: 'guest-password' }

  // Área da recepção
  | { id: 'staff-reservations' }
  | { id: 'staff-guests' }
  | { id: 'checkin' }
  | { id: 'checkout' }
  | { id: 'staff-rooms' }
  | { id: 'housekeeping' }
  | { id: 'maintenance' }

  // Área administrativa
  | { id: 'admin-rooms' }
  | { id: 'admin-categories' }
  | { id: 'admin-guests' }
  | { id: 'admin-reservations' }
  | { id: 'employees' }
  | { id: 'settings' }
  | { id: 'permissions' };


export type AuthUser =
  | { type: 'guest'; data: Guest }
  | { type: 'staff'; data: Employee }
  | { type: 'admin'; data: Employee };

export function getUserAreaPage(user: AuthUser): Page {
  switch (user.type) {
    case 'admin':
      return { id: 'admin-rooms' };

    case 'staff':
      return { id: 'staff-reservations' };

    case 'guest':
      return { id: 'my-reservations' };
  }
}

interface AppContextType {
  page: Page;
  navigate: (page: Page) => void;
  currentUser: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Restaura a sessão salva para o F5 não deslogar nem voltar para a home
function lerSalvo<T>(chave: string, padrao: T): T {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : padrao;
  } catch {
    return padrao;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>(() => lerSalvo<Page>('page', { id: 'home' }));
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => lerSalvo<AuthUser | null>('usuario', null));

  function navigate(nextPage: Page) {
    setPage(nextPage);
    localStorage.setItem('page', JSON.stringify(nextPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function login(user: AuthUser) {
    setCurrentUser(user);
    localStorage.setItem('usuario', JSON.stringify(user));
    navigate(getUserAreaPage(user));
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate({ id: 'home' });
  }

  return (
    <AppContext.Provider value={{ page, navigate, currentUser, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
