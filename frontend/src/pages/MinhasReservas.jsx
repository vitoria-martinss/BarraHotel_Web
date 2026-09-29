import { useEffect, useState } from 'react';
import { minhasReservas } from '../api';
import { useAuth } from '../context/AuthContext';

const ROTULOS_STATUS = {
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  concluida: 'Concluída',
};

export default function MinhasReservas() {
  const { sessao } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    minhasReservas(sessao.token)
      .then(setReservas)
      .finally(() => setCarregando(false));
  }, [sessao.token]);

  return (
    <div className="pagina">
      <h1>Minhas reservas</h1>

      {carregando && <p className="mensagem">Carregando…</p>}
      {!carregando && reservas.length === 0 && <p className="mensagem">Você ainda não tem reservas.</p>}

      <div className="lista-reservas">
        {reservas.map((r) => (
          <div className="cartao-reserva" key={r.id}>
            <div>
              <h3>{r.tipo_nome} — Quarto {r.quarto_numero}</h3>
              <p>
                {new Date(r.data_checkin).toLocaleDateString('pt-BR')} até{' '}
                {new Date(r.data_checkout).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="lado-direito-reserva">
              <span className="preco">R$ {Number(r.valor_total).toFixed(2)}</span>
              <span className={`selo-status status-${r.status}`}>{ROTULOS_STATUS[r.status]}</span>
              <span className={`selo-pagamento ${r.pago ? 'pago' : 'pendente'}`}>
                {r.pago ? 'Pago' : 'Pagamento pendente'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
