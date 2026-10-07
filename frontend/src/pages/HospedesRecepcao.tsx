import DashboardLayout from '../layouts/DashboardLayout';
import { STAFF_NAV } from '../config/navigation';
import GestaoHospedes from '../components/GestaoHospedes';

function StaffGuestsPage() {
  return (
    <DashboardLayout title="Área de Funcionários" navItems={STAFF_NAV} area="staff">
      <GestaoHospedes podeExcluir={false} />
    </DashboardLayout>
  );
}

export default StaffGuestsPage;