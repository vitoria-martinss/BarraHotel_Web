import { useEffect, useState } from 'react';
import { Button, Badge, Card, Modal, Alert, Tabs, EmptyState } from '../ui';
import DashboardLayout from '../layouts/DashboardLayout';
import { GUEST_NAV } from '../config/navigation';
import EditarDatasReserva from '../components/EditarDatasReserva';
import { chamarApi, mensagemDeErro, rotulosStatus, type Reserva } from '../services/api';
import { formatarMoeda, formatarData } from '../utils/formatters';

function noites(reserva: Reserva) {
  return Math.round((new Date(reserva.data_checkout).getTime() - new Date(reserva.data_checkin).getTime()) / 86400000);
}

function MyReservationsPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [aba, setAba] = useState('todas');
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState<Reserva | null>(null);
  const [cancelando, setCancelando] = useState<Reserva | null>(null);

  async function carregar() {
    try {
      setReservas(await chamarApi<Reserva[]>('/api/reservas/minhas'));
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function cancelar() {
    if (!cancelando) return;
    try {
      await chamarApi(`/api/reservas/${cancelando.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'cancelada' }),
      });
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
    setCancelando(null);
  }

  const porStatus = (status: Reserva['status']) => reservas.filter(r => r.status === status);
  const exibidas = aba === 'todas' ? reservas : porStatus(aba as Reserva['status']);

  return (
    <DashboardLayout title="Área do Hóspede" navItems={GUEST_NAV} area="guest">
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Minhas Reservas</h1>

        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

        <Tabs
          tabs={[
            { id: 'todas', label: 'Todas', count: reservas.length },
            { id: 'confirmada', label: 'Ativas', count: porStatus('confirmada').length },
            { id: 'concluida', label: 'Histórico', count: porStatus('concluida').length },
            { id: 'cancelada', label: 'Canceladas', count: porStatus('cancelada').length },
          ]}
          active={aba}
          onChange={setAba}
        />

        {exibidas.length === 0 ? (
          <Card className="p-8">
            <EmptyState title="Nenhuma reserva encontrada" description="Não há reservas nesta categoria" />
          </Card>
        ) : (
          <div className="space-y-3">
            {exibidas.map(reserva => (
              <Card key={reserva.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono-data text-slate-400">#{reserva.id}</p>
                    <h3 className="font-semibold text-slate-800">{reserva.tipo_nome} — Quarto {reserva.quarto_numero}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatarData(reserva.data_checkin)} a {formatarData(reserva.data_checkout)} · {noites(reserva)} noite{noites(reserva) > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge label={rotulosStatus[reserva.status]} />
                    <p className="text-sm font-bold text-slate-800 mt-2">{formatarMoeda(reserva.valor_total)}</p>
                    <p className="text-xs text-slate-400">{reserva.pago ? 'Pago' : 'Pagamento pendente'}</p>
                  </div>
                </div>
                {reserva.status === 'confirmada' && (
                  <div className="flex gap-2 mt-3 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setEditando(reserva)}>Alterar datas</Button>
                    <Button variant="danger" size="sm" onClick={() => setCancelando(reserva)}>Cancelar reserva</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <EditarDatasReserva
        reserva={editando}
        aoFechar={() => setEditando(null)}
        aoSalvar={() => { setEditando(null); carregar(); }}
      />

      <Modal open={!!cancelando} onClose={() => setCancelando(null)} title="Cancelar reserva" size="sm">
        <p className="text-sm text-slate-600 mb-5">Deseja cancelar a reserva #{cancelando?.id}?</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCancelando(null)}>Voltar</Button>
          <Button variant="danger" onClick={cancelar}>Cancelar reserva</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default MyReservationsPage;