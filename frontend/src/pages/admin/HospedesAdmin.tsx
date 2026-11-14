import DashboardLayout from "../../layouts/DashboardLayout";
import { ADMIN_NAV } from "../../config/navigation";
import GestaoHospedes from "../../components/GestaoHospedes";

function HospedesAdmin() {
  return (
    <DashboardLayout
      title="Painel Administrativo"
      navItems={ADMIN_NAV}
      area="admin"
    >
      <GestaoHospedes podeExcluir />
    </DashboardLayout>
  );
}

export default HospedesAdmin;
