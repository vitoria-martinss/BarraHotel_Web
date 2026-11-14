import DashboardLayout from "../../layouts/DashboardLayout";
import { ADMIN_NAV } from "../../config/navigation";
import GestaoReservas from "../../components/GestaoReservas";

function ReservasAdmin() {
  return (
    <DashboardLayout
      title="Painel Administrativo"
      navItems={ADMIN_NAV}
      area="admin"
    >
      <GestaoReservas podeExcluir />
    </DashboardLayout>
  );
}

export default ReservasAdmin;
