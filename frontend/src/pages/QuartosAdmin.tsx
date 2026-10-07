import { useEffect, useState } from 'react';
import { Button, Badge, Card, Table, Pagination, SearchBar, Modal, Alert, Input, Select } from '../ui';
import DashboardLayout from '../layouts/DashboardLayout';
import { ADMIN_NAV } from '../config/navigation';
import { chamarApi, type QuartoFisico, type TipoQuarto } from '../services/api';
import { formatarMoeda } from '../utils/formatters';

type Formulario = { numero: string; tipo_id: string };

const POR_PAGINA = 10;

function mensagem(falha: unknown) {
  return falha instanceof Error ? falha.message : 'Erro inesperado';
}

function AdminRoomsPage() {
  const [quartos, setQuartos] = useState<QuartoFisico[]>([]);
  const [tipos, setTipos] = useState<TipoQuarto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<QuartoFisico | null>(null);
  const [formulario, setFormulario] = useState<Formulario>({ numero: '', tipo_id: '' });
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<QuartoFisico | null>(null);

  async function carregar() {
    try {
      const [listaQuartos, listaTipos] = await Promise.all([
        chamarApi<QuartoFisico[]>('/api/quartos'),
        chamarApi<TipoQuarto[]>('/api/tipos-quarto'),
      ]);
      setQuartos(listaQuartos);
      setTipos(listaTipos);
    } catch (falha) {
      setErro(mensagem(falha));
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = quartos.filter(q => {
    if (busca && !`${q.numero} ${q.tipo}`.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtroTipo && String(q.tipo_id) !== filtroTipo) return false;
    return true;
  });

  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const ocupados = quartos.filter(q => q.ocupado).length;

  const resumo = [
    { rotulo: 'Total', valor: quartos.length, cor: '#1B2B4B' },
    { rotulo: 'Ocupados', valor: ocupados, cor: '#F59E0B' },
    { rotulo: 'Disponíveis', valor: quartos.length - ocupados, cor: '#10B981' },
  ];

  const opcoesTipo = tipos.map(t => ({ value: String(t.id), label: t.nome }));

  function abrirNovo() {
    setEditando(null);
    setFormulario({ numero: '', tipo_id: String(tipos[0]?.id ?? '') });
    setErro('');
    setAberto(true);
  }

  function abrirEdicao(quarto: QuartoFisico) {
    setEditando(quarto);
    setFormulario({ numero: quarto.numero, tipo_id: String(quarto.tipo_id) });
    setErro('');
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
    setEditando(null);
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await chamarApi(editando ? `/api/quartos/${editando.id}` : '/api/quartos', {
        method: editando ? 'PUT' : 'POST',
        body: JSON.stringify({ numero: formulario.numero, tipo_id: Number(formulario.tipo_id) }),
      });
      fechar();
      await carregar();
    } catch (falha) {
      setErro(mensagem(falha));
    }
    setSalvando(false);
  }

  async function excluir() {
    if (!excluindo) return;
    try {
      await chamarApi(`/api/quartos/${excluindo.id}`, { method: 'DELETE' });
      await carregar();
    } catch (falha) {
      setErro(mensagem(falha));
    }
    setExcluindo(null);
  }

  return (
    <DashboardLayout title="Painel Administrativo" navItems={ADMIN_NAV} area="admin">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Gestão de Quartos</h1>
          <Button variant="primary" onClick={abrirNovo}>+ Cadastrar quarto</Button>
        </div>

        {erro && !aberto && <Alert type="error" message={erro} onClose={() => setErro('')} />}

        <div className="grid grid-cols-3 gap-3">
          {resumo.map(item => (
            <div key={item.rotulo} className="bg-white rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-xl font-bold" style={{ color: item.cor }}>{item.valor}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.rotulo}</p>
            </div>
          ))}
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <SearchBar value={busca} onChange={valor => { setBusca(valor); setPagina(1); }} className="flex-1 min-w-48 max-w-xs" />
            <select
              value={filtroTipo}
              onChange={e => { setFiltroTipo(e.target.value); setPagina(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
            >
              <option value="">Todos os tipos</option>
              {opcoesTipo.map(opcao => <option key={opcao.value} value={opcao.value}>{opcao.label}</option>)}
            </select>
          </div>

          <Table
            loading={carregando}
            data={paginados}
            emptyMessage="Nenhum quarto cadastrado"
            columns={[
              { key: 'numero', header: 'Número', render: q => <span className="font-bold text-slate-800">Quarto {q.numero}</span> },
              { key: 'tipo', header: 'Tipo', render: q => <span className="font-medium text-sm">{q.tipo}</span> },
              { key: 'capacidade', header: 'Capac.', render: q => <span className="text-sm">{q.capacidade} pess.</span> },
              { key: 'diaria', header: 'Diária', render: q => <span className="text-sm font-semibold text-[#B8963E]">{formatarMoeda(q.preco_diaria)}</span> },
              {
                key: 'hoje',
                header: 'Hoje',
                render: q => (
                  <div>
                    <Badge label={q.ocupado ? 'Ocupado' : 'Disponível'} />
                    {q.hospede && <p className="text-xs text-slate-400 mt-1">{q.hospede}</p>}
                  </div>
                ),
              },
              {
                key: 'acoes',
                header: 'Ações',
                render: q => (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(q)}>Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => setExcluindo(q)}>Excluir</Button>
                  </div>
                ),
              },
            ]}
          />
          <Pagination total={filtrados.length} page={pagina} perPage={POR_PAGINA} onChange={setPagina} />
        </Card>
      </div>

      <Modal open={aberto} onClose={fechar} title={editando ? 'Editar quarto' : 'Cadastrar quarto'}>
        <form onSubmit={salvar} className="space-y-4">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          {tipos.length === 0 && <Alert type="warning" message="Cadastre um tipo de quarto antes de cadastrar quartos." />}
          <Input
            label="Número do quarto"
            required
            placeholder="ex: 101"
            value={formulario.numero}
            onChange={e => setFormulario({ ...formulario, numero: e.target.value })}
          />
          <Select
            label="Tipo"
            options={opcoesTipo}
            value={formulario.tipo_id}
            onChange={e => setFormulario({ ...formulario, tipo_id: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={fechar}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={salvando} disabled={tipos.length === 0}>Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!excluindo} onClose={() => setExcluindo(null)} title="Excluir quarto" size="sm">
        <p className="text-sm text-slate-600 mb-5">
          Excluir o quarto {excluindo?.numero}? Só é possível se não houver reservas vinculadas.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setExcluindo(null)}>Cancelar</Button>
          <Button variant="danger" onClick={excluir}>Excluir</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default AdminRoomsPage;