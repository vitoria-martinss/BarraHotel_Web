import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  listarQuartos,
  todasReservas,
  atualizarStatusReserva,
  confirmarPagamento,
  listarHospedes,
  cadastrarHospedeManual,
  listarTiposQuarto,
  criarReserva,
} from '../api';

const ABAS = ['Ocupação', 'Reservas', 'Nova reserva', 'Cadastrar hóspede'];

export default function PainelRecepcionista() {
  const { sessao } = useAuth();
  const [aba, setAba] = useState('Ocupação');

  return (
    <div className="pagina">
      <h1>Painel da recepção</h1>

      <div className="abas">
        {ABAS.map((a) => (
          <button key={a} className={a === aba ? 'aba ativa' : 'aba'} onClick={() => setAba(a)}>
            {a}
          </button>
        ))}
      </div>

      {aba === 'Ocupação' && <Ocupacao token={sessao.token} />}
      {aba === 'Reservas' && <ListaReservas token={sessao.token} />}
      {aba === 'Nova reserva' && <NovaReserva token={sessao.token} />}
      {aba === 'Cadastrar hóspede' && <CadastrarHospede token={sessao.token} />}
    </div>
  );
}

export function Ocupacao({ token }) {
  const [quartos, setQuartos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarQuartos(token)
      .then(setQuartos)
      .finally(() => setCarregando(false));
  }, [token]);

  if (carregando) return <p className="mensagem">Carregando…</p>;

  return (
    <div className="grade-ocupacao">
      {quartos.map((q) => (
        <div key={q.id} className={`cartao-ocupacao ${q.ocupado ? 'ocupado' : 'livre'}`}>
          <span className="numero-quarto">Quarto {q.numero}</span>
          <span className="tipo-quarto-pequeno">{q.tipo}</span>
          {q.ocupado ? (
            <>
              <span className="status-ocupacao">Ocupado</span>
              <span className="hospede-ocupacao">{q.hospede}</span>
              <span className="periodo-ocupacao">
                até {new Date(q.checkout).toLocaleDateString('pt-BR')}
              </span>
            </>
          ) : (
            <span className="status-ocupacao livre">Livre</span>
          )}
        </div>
      ))}
    </div>
  );
}

const ROTULOS_STATUS = { confirmada: 'Confirmada', cancelada: 'Cancelada', concluida: 'Concluída' };

export function ListaReservas({ token }) {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  function carregar() {
    setCarregando(true);
    todasReservas(token)
      .then(setReservas)
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, [token]);

  async function mudarStatus(id, status) {
    await atualizarStatusReserva(token, id, status);
    carregar();
  }

  async function pagar(id) {
    await confirmarPagamento(token, id);
    carregar();
  }

  if (carregando) return <p className="mensagem">Carregando…</p>;

  return (
    <table className="tabela">
      <thead>
        <tr>
          <th>Hóspede</th>
          <th>Quarto</th>
          <th>Período</th>
          <th>Valor</th>
          <th>Status</th>
          <th>Pagamento</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {reservas.map((r) => (
          <tr key={r.id}>
            <td>{r.hospede_nome}</td>
            <td>{r.tipo_nome} — {r.quarto_numero}</td>
            <td>
              {new Date(r.data_checkin).toLocaleDateString('pt-BR')} –{' '}
              {new Date(r.data_checkout).toLocaleDateString('pt-BR')}
            </td>
            <td>R$ {Number(r.valor_total).toFixed(2)}</td>
            <td>{ROTULOS_STATUS[r.status]}</td>
            <td>{r.pago ? 'Pago' : (
              <button className="link" onClick={() => pagar(r.id)}>marcar como pago</button>
            )}</td>
            <td className="acoes-tabela">
              {r.status === 'confirmada' && (
                <>
                  <button className="link" onClick={() => mudarStatus(r.id, 'concluida')}>concluir</button>
                  <button className="link" onClick={() => mudarStatus(r.id, 'cancelada')}>cancelar</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function NovaReserva({ token }) {
  const [tipos, setTipos] = useState([]);
  const [busca, setBusca] = useState('');
  const [hospedes, setHospedes] = useState([]);
  const [form, setForm] = useState({ hospede_id: '', tipo_id: '', data_checkin: '', data_checkout: '' });
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    listarTiposQuarto().then(setTipos);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      listarHospedes(token, busca).then(setHospedes);
    }, 300);
    return () => clearTimeout(debounce);
  }, [busca, token]);

  async function enviar(e) {
    e.preventDefault();
    setMensagem(null);
    try {
      const resultado = await criarReserva(token, {
        ...form,
        tipo_id: Number(form.tipo_id),
        hospede_id: Number(form.hospede_id),
      });
      setMensagem({ tipo: 'sucesso', texto: `Reserva criada! Valor: R$ ${resultado.valor_total}` });
      setForm({ hospede_id: '', tipo_id: '', data_checkin: '', data_checkout: '' });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  return (
    <form className="form-vertical form-estreito" onSubmit={enviar}>
      <label>
        Buscar hóspede pelo nome
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite para buscar…" />
      </label>
      <label>
        Hóspede
        <select value={form.hospede_id} onChange={(e) => setForm({ ...form, hospede_id: e.target.value })} required>
          <option value="">Selecione…</option>
          {hospedes.map((h) => (
            <option key={h.id} value={h.id}>{h.nome}{h.email ? ` — ${h.email}` : ''}</option>
          ))}
        </select>
      </label>
      <label>
        Tipo de quarto
        <select value={form.tipo_id} onChange={(e) => setForm({ ...form, tipo_id: e.target.value })} required>
          <option value="">Selecione…</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>{t.nome} — R$ {Number(t.preco_diaria).toFixed(2)}/noite</option>
          ))}
        </select>
      </label>
      <label>
        Check-in
        <input type="date" value={form.data_checkin} onChange={(e) => setForm({ ...form, data_checkin: e.target.value })} required />
      </label>
      <label>
        Check-out
        <input type="date" value={form.data_checkout} onChange={(e) => setForm({ ...form, data_checkout: e.target.value })} required />
      </label>
      {mensagem && <p className={mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}>{mensagem.texto}</p>}
      <button type="submit">Criar reserva</button>
    </form>
  );
}

export function CadastrarHospede({ token }) {
  const [form, setForm] = useState({ nome: '', documento: '', telefone: '', email: '' });
  const [mensagem, setMensagem] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    setMensagem(null);
    try {
      await cadastrarHospedeManual(token, form);
      setMensagem({ tipo: 'sucesso', texto: 'Hóspede cadastrado com sucesso.' });
      setForm({ nome: '', documento: '', telefone: '', email: '' });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  return (
    <form className="form-vertical form-estreito" onSubmit={enviar}>
      <p className="ajuda">
        Use isso para hóspedes que não vão se cadastrar sozinhos online (ex: pessoas idosas).
        Não é necessário e-mail nem senha.
      </p>
      <label>
        Nome completo
        <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
      </label>
      <label>
        Documento (CPF/RG)
        <input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
      </label>
      <label>
        Telefone
        <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
      </label>
      <label>
        E-mail (opcional)
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      {mensagem && <p className={mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}>{mensagem.texto}</p>}
      <button type="submit">Cadastrar hóspede</button>
    </form>
  );
}
