import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import QuartoDetalhe from './pages/QuartoDetalhe';
import CadastroHospede from './pages/CadastroHospede';
import LoginHospede from './pages/LoginHospede';
import LoginFuncionario from './pages/LoginFuncionario';
import MinhasReservas from './pages/MinhasReservas';
import PainelRecepcionista from './pages/PainelRecepcionista';
import PainelAdmin from './pages/PainelAdmin';
import RotaProtegida from './components/RotaProtegida';
import MenuHamburguer from './components/MenuHamburguer';

export default function App() {
  const { sessao, sair } = useAuth();
  const navigate = useNavigate();

  function sairEVoltar() {
    sair();
    navigate('/');
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="marca">
          Baaaaaarra Hotel 
        </Link>

        <MenuHamburguer>
          {!sessao && (
            <>
              <Link to="/entrar">Entrar</Link>
              <Link to="/cadastro" className="botao-nav">
                Criar conta
              </Link>
              <Link to="/funcionarios" className="link-discreto">
                Acesso da equipe
              </Link>
            </>
          )}

          {sessao?.usuario.papel === 'hospede' && (
            <>
              <Link to="/minhas-reservas">Minhas reservas</Link>
              <button className="botao-nav" onClick={sairEVoltar}>
                Sair
              </button>
            </>
          )}

          {sessao?.usuario.papel === 'recepcionista' && (
            <>
              <Link to="/recepcao">Painel da recepção</Link>
              <button className="botao-nav" onClick={sairEVoltar}>
                Sair
              </button>
            </>
          )}

          {sessao?.usuario.papel === 'admin' && (
            <>
              <Link to="/admin">Painel do admin</Link>
              <button className="botao-nav" onClick={sairEVoltar}>
                Sair
              </button>
            </>
          )}
        </MenuHamburguer>
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quartos/:id" element={<QuartoDetalhe />} />
        <Route path="/cadastro" element={<CadastroHospede />} />
        <Route path="/entrar" element={<LoginHospede />} />
        <Route path="/funcionarios" element={<LoginFuncionario />} />

        <Route
          path="/minhas-reservas"
          element={
            <RotaProtegida papeisPermitidos={['hospede']}>
              <MinhasReservas />
            </RotaProtegida>
          }
        />

        <Route
          path="/recepcao"
          element={
            <RotaProtegida papeisPermitidos={['recepcionista', 'admin']}>
              <PainelRecepcionista />
            </RotaProtegida>
          }
        />

        <Route
          path="/admin"
          element={
            <RotaProtegida papeisPermitidos={['admin']}>
              <PainelAdmin />
            </RotaProtegida>
          }
        />
      </Routes>
    </div>
  );
}
