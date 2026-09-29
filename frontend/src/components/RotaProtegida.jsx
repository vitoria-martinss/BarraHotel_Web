import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// papeisPermitidos: lista de papéis que podem acessar. Se vazio, só exige estar logado.
export default function RotaProtegida({ papeisPermitidos, children }) {
  const { sessao } = useAuth();

  if (!sessao) return <Navigate to="/entrar" replace />;

  if (papeisPermitidos && !papeisPermitidos.includes(sessao.usuario.papel)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
