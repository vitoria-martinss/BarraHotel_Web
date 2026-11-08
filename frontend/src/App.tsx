import { AppProvider, useApp } from "./store";
import Home from "./pages/public/Home";
import Quartos from "./pages/public/Quartos";
import QuartoDetalhes from "./pages/public/QuartoDetalhes";
import Servicos from "./pages/public/Servicos";
import Sobre from "./pages/public/Sobre";
import Contato from "./pages/public/Contato";
import Login from "./pages/public/Login";
import Cadastro from "./pages/public/Cadastro";
import EsqueciSenha from "./pages/hospede/EsqueciSenha";
import NovaReserva from "./pages/hospede/NovaReserva";
import MinhasReservas from "./pages/hospede/MinhasReservas";
import PerfilHospede from "./pages/hospede/PerfilHospede";
import AlterarSenha from "./pages/hospede/AlterarSenha";
import ReservasRecepcao from "./pages/recepcao/ReservasRecepcao";
import HospedesRecepcao from "./pages/recepcao/HospedesRecepcao";
import CheckIn from "./pages/recepcao/CheckIn";
import CheckOut from "./pages/recepcao/CheckOut";
import QuartosRecepcao from "./pages/recepcao/QuartosRecepcao";
import Governanca from "./pages/recepcao/Governanca";
import Manutencao from "./pages/recepcao/Manutencao";
import QuartosAdmin from "./pages/admin/QuartosAdmin";
import Categorias from "./pages/admin/Categorias";
import HospedesAdmin from "./pages/admin/HospedesAdmin";
import ReservasAdmin from "./pages/admin/ReservasAdmin";
import Funcionarios from "./pages/admin/Funcionarios";
import Configuracoes from "./pages/admin/Configuracoes";
import Permissoes from "./pages/admin/Permissoes";

function Router() {
  const { page } = useApp();

  switch (page.id) {
    case "home":
      return <Home />;
    case "rooms":
      return <Quartos />;
    case "room-detail":
      return <QuartoDetalhes roomId={page.roomId} />;
    case "services":
      return <Servicos />;
    case "about":
      return <Sobre />;
    case "contact":
      return <Contato />;
    case "login":
      return <Login />;
    case "register":
      return <Cadastro />;
    case "forgot-password":
      return <EsqueciSenha />;
    case "booking":
      return <NovaReserva initialRoomId={page.roomId} />;
    case "my-reservations":
      return <MinhasReservas />;
    case "guest-profile":
      return <PerfilHospede />;
    case "guest-password":
      return <AlterarSenha />;
    case "staff-reservations":
      return <ReservasRecepcao />;
    case "staff-guests":
      return <HospedesRecepcao />;
    case "checkin":
      return <CheckIn />;
    case "checkout":
      return <CheckOut />;
    case "staff-rooms":
      return <QuartosRecepcao />;
    case "housekeeping":
      return <Governanca />;
    case "maintenance":
      return <Manutencao />;
    case "admin-rooms":
      return <QuartosAdmin />;
    case "admin-categories":
      return <Categorias />;
    case "admin-guests":
      return <HospedesAdmin />;
    case "admin-reservations":
      return <ReservasAdmin />;
    case "employees":
      return <Funcionarios />;
    case "settings":
      return <Configuracoes />;
    case "permissions":
      return <Permissoes />;
    default:
      return <Home />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
