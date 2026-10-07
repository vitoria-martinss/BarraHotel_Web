import { useEffect, useState } from 'react';
import { Button, Badge, Card, Table, Pagination, SearchBar, Modal, Alert, Input } from '../ui';
import { chamarApi, type Hospede } from '../services/api';

type Formulario = { nome: string; email: string; telefone: string; documento: string };

const formularioVazio: Formulario = { nome: '', email: '', telefone: '', documento: '' };
const POR_PAGINA = 10;

function mensagem(falha: unknown) {
  return falha instanceof Error ? falha.message : 'Erro inesperado';
}

export default function GestaoHospedes({ podeExcluir }: { podeExcluir: boolean }) {
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Hospede | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(formularioVazio);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<Hospede | null>(null);

  async function carregar() {
    try {
      setHospedes(await chamarApi<Hospede[]>('/api/usuarios/hospedes'));
    } catch (falha) {
      setErro(mensagem(falha));
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = hospedes.filter(h =>
    !busca || `${h.nome} ${h.email ?? ''} ${h.documento ?? ''}`.toLowerCase().includes(busca.toLowerCase())
  );
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function abrirNovo() {
    setEditando(null);
    setFormulario(formularioVazio);
    setErro('');
    setAberto(true);
  }

  function abrirEdicao(hospede: Hospede) {
    setEditando(hospede);
    setFormulario({
      nome: hospede.nome,
      email: hospede.email ?? '',
      telefone: hospede.telefone ?? '',
      documento: hospede.documento ?? '',
    });
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
      await chamarApi(editando ? `/api/usuarios/hospedes/${editando.id}` : '/api/usuarios/hospedes', {
        method: editando ? 'PUT' : 'POST',
        body: JSON.stringify(formulario),
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
      await chamarApi(`/api/usuarios/hospedes/${excluindo.id}`, { method: 'DELETE' });
      await carregar();
    } catch (falha) {
      setErro(mensagem(falha));
    }
    setExcluindo(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Gestão de Hóspedes</h1>
        <Button variant="primary" onClick={abrirNovo}>+ Cadastrar hóspede</Button>
      </div>

      {erro && !aberto && <Alert type="error" message={erro} onClose={() => setErro('')} />}

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <SearchBar
            value={busca}
            onChange={valor => { setBusca(valor); setPagina(1); }}
            placeholder="Buscar por nome, e-mail ou documento..."
            className="flex-1 max-w-sm"
          />
          <span className="text-sm text-slate-400">{filtrados.length} hóspede{filtrados.length !== 1 ? 's' : ''}</span>
        </div>

        <Table
          loading={carregando}
          data={paginados}
          emptyMessage="Nenhum hóspede encontrado"
          columns={[
            {
              key: 'nome',
              header: 'Nome',
              render: h => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1B2B4B] text-white text-xs flex items-center justify-center font-bold">{h.nome.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{h.nome}</p>
                    <p className="text-xs text-slate-400">{h.email ?? 'Sem e-mail'}</p>
                  </div>
                </div>
              ),
            },
            { key: 'documento', header: 'Documento', render: h => <span className="font-mono-data text-xs text-slate-600">{h.documento ?? ''}</span> },
            { key: 'telefone', header: 'Telefone', render: h => <span className="text-sm text-slate-600">{h.telefone ?? ''}</span> },
            { key: 'acesso', header: 'Acesso online', render: h => <Badge label={h.tem_login ? 'Com acesso' : 'Sem acesso'} /> },
            { key: 'reservas', header: 'Reservas', render: h => <span className="text-sm font-semibold">{h.total_reservas}</span> },
            {
              key: 'acoes',
              header: 'Ações',
              render: h => (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => abrirEdicao(h)}>Editar</Button>
                  {podeExcluir && (
                    <Button variant="danger" size="sm" disabled={h.total_reservas > 0} onClick={() => setExcluindo(h)}>Excluir</Button>
                  )}
                </div>
              ),
            },
          ]}
        />
        <Pagination total={filtrados.length} page={pagina} perPage={POR_PAGINA} onChange={setPagina} />
      </Card>

      <Modal open={aberto} onClose={fechar} title={editando ? 'Editar hóspede' : 'Cadastrar hóspede'}>
        <form onSubmit={salvar} className="space-y-4">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          <Input label="Nome" required value={formulario.nome} onChange={e => setFormulario({ ...formulario, nome: e.target.value })} />
          <Input label="E-mail" type="email" value={formulario.email} onChange={e => setFormulario({ ...formulario, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Documento" value={formulario.documento} onChange={e => setFormulario({ ...formulario, documento: e.target.value })} />
            <Input label="Telefone" value={formulario.telefone} onChange={e => setFormulario({ ...formulario, telefone: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={fechar}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={salvando}>Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!excluindo} onClose={() => setExcluindo(null)} title="Excluir hóspede" size="sm">
        <p className="text-sm text-slate-600 mb-5">Excluir o hóspede {excluindo?.nome}? Esta ação não pode ser desfeita.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setExcluindo(null)}>Cancelar</Button>
          <Button variant="danger" onClick={excluir}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}