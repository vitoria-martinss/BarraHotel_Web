import { useEffect, useState } from 'react';
import { Button, Badge, Card, Table, Pagination, SearchBar, Modal, Alert, Input, Select, Dropdown } from '../ui';
import EditarDatasReserva from './EditarDatasReserva';
import {
  chamarApi,
  mensagemDeErro,
  rotulosStatus,
  type Hospede,
  type Reserva,
  type TipoQuarto,
} from '../services/api';
import { formatarMoeda, formatarData } from '../utils/formatters';

type TipoAcao = 'pagar' | 'concluir' | 'cancelar' | 'excluir';

const acoes: Record<
  TipoAcao,
  { titulo: string; verbo: string; perigo: boolean; requisicao: (id: number) => { caminho: string; opcoes: RequestInit } }
> = {
  pagar: {
    titulo: 'Confirmar pagamento',
    verbo: 'marcar como paga',
    perigo: false,
    requisicao: id => ({ caminho: `/api/reservas/${id}/pagamento`, opcoes: { method: 'PUT' } }),
  },
  concluir: {
    titulo: 'Concluir reserva',
    verbo: 'concluir',
    perigo: false,
    requisicao: id => ({
      caminho: `/api/reservas/${id}/status`,
      opcoes: { method: 'PUT', body: JSON.stringify({ status: 'concluida' }) },
    }),
  },
  cancelar: {
    titulo: 'Cancelar reserva',
    verbo: 'cancelar',
    perigo: true,
    requisicao: id => ({
      caminho: `/api/reservas/${id}/status`,
      opcoes: { method: 'PUT', body: JSON.stringify({ status: 'cancelada' }) },
    }),
  },
  excluir: {
    titulo: 'Excluir reserva',
    verbo: 'excluir definitivamente',
    perigo: true,
    requisicao: id => ({ caminho: `/api/reservas/${id}`, opcoes: { method: 'DELETE' } }),
  },
};

type FormularioNova = { hospede_id: string; tipo_id: string; data_checkin: string; data_checkout: string };

const POR_PAGINA = 10;

export default function GestaoReservas({ podeExcluir }: { podeExcluir: boolean }) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<Reserva | null>(null);
  const [pendente, setPendente] = useState<{ reserva: Reserva; tipo: TipoAcao } | null>(null);
  const [novaAberta, setNovaAberta] = useState(false);
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [tipos, setTipos] = useState<TipoQuarto[]>([]);
  const [formulario, setFormulario] = useState<FormularioNova>({ hospede_id: '', tipo_id: '', data_checkin: '', data_checkout: '' });
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setReservas(await chamarApi<Reserva[]>('/api/reservas'));
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtradas = reservas.filter(r => {
    const texto = `${r.id} ${r.hospede_nome} ${r.quarto_numero} ${r.tipo_nome}`.toLowerCase();
    if (busca && !texto.includes(busca.toLowerCase())) return false;
    if (filtroStatus && r.status !== filtroStatus) return false;
    return true;
  });
  const paginadas = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  async function abrirNova() {
    setErro('');
    try {
      const [listaHospedes, listaTipos] = await Promise.all([
        chamarApi<Hospede[]>('/api/usuarios/hospedes'),
        chamarApi<TipoQuarto[]>('/api/tipos-quarto'),
      ]);
      setHospedes(listaHospedes);
      setTipos(listaTipos);
      setFormulario({
        hospede_id: String(listaHospedes[0]?.id ?? ''),
        tipo_id: String(listaTipos[0]?.id ?? ''),
        data_checkin: '',
        data_checkout: '',
      });
      setNovaAberta(true);
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }

  async function criar(evento: React.FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await chamarApi('/api/reservas', {
        method: 'POST',
        body: JSON.stringify({
          hospede_id: Number(formulario.hospede_id),
          tipo_id: Number(formulario.tipo_id),
          data_checkin: formulario.data_checkin,
          data_checkout: formulario.data_checkout,
        }),
      });
      setNovaAberta(false);
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
    setSalvando(false);
  }

  async function executar() {
    if (!pendente) return;
    const { caminho, opcoes } = acoes[pendente.tipo].requisicao(pendente.reserva.id);
    try {
      await chamarApi(caminho, opcoes);
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
    setPendente(null);
  }

  function itensDaReserva(reserva: Reserva) {
    const itens: { label: string; danger?: boolean; onClick: () => void }[] = [];
    if (reserva.status === 'confirmada') {
      itens.push({ label: 'Alterar datas', onClick: () => setEditando(reserva) });
      if (!reserva.pago) itens.push({ label: 'Confirmar pagamento', onClick: () => setPendente({ reserva, tipo: 'pagar' }) });
      itens.push({ label: 'Concluir', onClick: () => setPendente({ reserva, tipo: 'concluir' }) });
      itens.push({ label: 'Cancelar', danger: true, onClick: () => setPendente({ reserva, tipo: 'cancelar' }) });
    }
    if (podeExcluir) itens.push({ label: 'Excluir', danger: true, onClick: () => setPendente({ reserva, tipo: 'excluir' }) });
    return itens;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Gestão de Reservas</h1>
        <Button variant="primary" onClick={abrirNova}>+ Nova reserva</Button>
      </div>

      {erro && !novaAberta && <Alert type="error" message={erro} onClose={() => setErro('')} />}

      <div className="flex gap-3 flex-wrap">
        {(Object.keys(rotulosStatus) as Reserva['status'][]).map(status => (
          <button
            key={status}
            onClick={() => { setFiltroStatus(filtroStatus === status ? '' : status); setPagina(1); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${filtroStatus === status ? 'border-[#1B2B4B] bg-[#1B2B4B] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
          >
            <span>{reservas.filter(r => r.status === status).length}</span>
            <span>{rotulosStatus[status]}</span>
          </button>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <SearchBar
            value={busca}
            onChange={valor => { setBusca(valor); setPagina(1); }}
            placeholder="Buscar por código, hóspede, quarto..."
            className="flex-1 max-w-sm"
          />
        </div>

        <Table
          loading={carregando}
          data={paginadas}
          emptyMessage="Nenhuma reserva encontrada"
          columns={[
            { key: 'codigo', header: 'Código', render: r => <span className="font-mono-data text-xs text-slate-600">#{r.id}</span> },
            { key: 'hospede', header: 'Hóspede', render: r => <span className="font-medium text-slate-800 text-sm">{r.hospede_nome}</span> },
            { key: 'quarto', header: 'Quarto', render: r => <span className="text-sm">Quarto {r.quarto_numero} — {r.tipo_nome}</span> },
            { key: 'checkin', header: 'Check-in', render: r => <span className="text-sm font-mono-data">{formatarData(r.data_checkin)}</span> },
            { key: 'checkout', header: 'Check-out', render: r => <span className="text-sm font-mono-data">{formatarData(r.data_checkout)}</span> },
            { key: 'valor', header: 'Valor', render: r => <span className="text-sm font-semibold text-[#B8963E]">{formatarMoeda(r.valor_total)}</span> },
            { key: 'pago', header: 'Pagamento', render: r => <Badge label={r.pago ? 'Pago' : 'Pendente'} /> },
            { key: 'status', header: 'Status', render: r => <Badge label={rotulosStatus[r.status]} /> },
            {
              key: 'acoes',
              header: 'Ações',
              render: r => {
                const itens = itensDaReserva(r);
                if (itens.length === 0) return null;
                return (
                  <Dropdown
                    trigger={
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Ações</button>
                    }
                    items={itens}
                  />
                );
              },
            },
          ]}
        />
        <Pagination total={filtradas.length} page={pagina} perPage={POR_PAGINA} onChange={setPagina} />
      </Card>

      <EditarDatasReserva
        reserva={editando}
        aoFechar={() => setEditando(null)}
        aoSalvar={() => { setEditando(null); carregar(); }}
      />

      <Modal open={novaAberta} onClose={() => setNovaAberta(false)} title="Nova reserva">
        <form onSubmit={criar} className="space-y-4">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          {hospedes.length === 0 && <Alert type="warning" message="Cadastre um hóspede antes de criar uma reserva." />}
          <Select
            label="Hóspede"
            options={hospedes.map(h => ({ value: String(h.id), label: h.nome }))}
            value={formulario.hospede_id}
            onChange={e => setFormulario({ ...formulario, hospede_id: e.target.value })}
          />
          <Select
            label="Tipo de quarto"
            options={tipos.map(t => ({ value: String(t.id), label: t.nome }))}
            value={formulario.tipo_id}
            onChange={e => setFormulario({ ...formulario, tipo_id: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Check-in" type="date" required value={formulario.data_checkin} onChange={e => setFormulario({ ...formulario, data_checkin: e.target.value })} />
            <Input label="Check-out" type="date" required min={formulario.data_checkin} value={formulario.data_checkout} onChange={e => setFormulario({ ...formulario, data_checkout: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setNovaAberta(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={salvando} disabled={hospedes.length === 0 || tipos.length === 0}>Criar reserva</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!pendente} onClose={() => setPendente(null)} title={pendente ? acoes[pendente.tipo].titulo : ''} size="sm">
        {pendente && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Deseja {acoes[pendente.tipo].verbo} a reserva <strong>#{pendente.reserva.id}</strong> de {pendente.reserva.hospede_nome}?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPendente(null)}>Voltar</Button>
              <Button variant={acoes[pendente.tipo].perigo ? 'danger' : 'primary'} onClick={executar}>Confirmar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}