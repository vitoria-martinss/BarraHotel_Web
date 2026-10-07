import DashboardLayout from '../layouts/DashboardLayout';
import { STAFF_NAV } from '../config/navigation';
import GestaoReservas from '../components/GestaoReservas';

function StaffReservationsPage() {
  return (
    <DashboardLayout title="Área de Funcionários" navItems={STAFF_NAV} area="staff">
      <GestaoReservas podeExcluir={false} />
    </DashboardLayout>
  );
}

export default StaffReservationsPage;