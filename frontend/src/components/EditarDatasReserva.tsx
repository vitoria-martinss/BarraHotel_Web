import { useEffect, useState } from 'react';
import { Button, Modal, Alert, Input } from '../ui';
import { chamarApi, mensagemDeErro, type Reserva } from '../services/api';

interface Props {
  reserva: Reserva | null;
  aoFechar: () => void;
  aoSalvar: () => void;
}

export default function EditarDatasReserva({ reserva, aoFechar, aoSalvar }: Props) {
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (reserva) {
      setCheckin(reserva.data_checkin);
      setCheckout(reserva.data_checkout);
      setErro('');
    }
  }, [reserva]);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!reserva) return;
    setSalvando(true);
    setErro('');
    try {
      await chamarApi(`/api/reservas/${reserva.id}`, {
        method: 'PUT',
        body: JSON.stringify({ data_checkin: checkin, data_checkout: checkout }),
      });
      aoSalvar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
    setSalvando(false);
  }

  return (
    <Modal open={!!reserva} onClose={aoFechar} title="Alterar datas da reserva" size="sm">
      <form onSubmit={salvar} className="space-y-4">
        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
        <Input label="Check-in" type="date" required value={checkin} onChange={e => setCheckin(e.target.value)} />
        <Input label="Check-out" type="date" required min={checkin} value={checkout} onChange={e => setCheckout(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={aoFechar}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={salvando}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}