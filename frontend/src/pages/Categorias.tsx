import { useEffect, useState } from 'react';
import { Button, Card, Table, Modal, Alert, Input } from '../ui';
import DashboardLayout from '../layouts/DashboardLayout';
import { ADMIN_NAV } from '../config/navigation';
import { chamarApi, type TipoQuarto } from '../services/api';
import { formatarMoeda } from '../utils/formatters';

type Formulario = {
  nome: string;
  descricao: string;
  preco_diaria: string;
  capacidade_pessoas: string;
};

const formularioVazio: Formulario = { nome: '', descricao: '', preco_diaria: '', capacidade_pessoas: '' };

function mensagem(falha: unknown) {
  return falha instanceof Error ? falha.message : 'Erro inesperado';
}

function AdminCategoriesPage() {
  const [tipos, setTipos] = useState<TipoQuarto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<TipoQuarto | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(formularioVazio);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<TipoQuarto | null>(null);

  async function carregar() {
    try {
      setTipos(await chamarApi<TipoQuarto[]>('/api/tipos-quarto'));
    } catch (falha) {
      setErro(mensagem(falha));
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setEditando(null);
    setFormulario(formularioVazio);
    setArquivos([]);
    setErro('');
    setAberto(true);
  }

  function abrirEdicao(tipo: TipoQuarto) {
    setEditando(tipo);
    setFormulario({
      nome: tipo.nome,
      descricao: tipo.descricao ?? '',
      preco_diaria: String(tipo.preco_diaria),
      capacidade_pessoas: String(tipo.capacidade_pessoas),
    });
    setArquivos([]);
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
    const dados = new FormData();
    Object.entries(formulario).forEach(([chave, valor]) => dados.append(chave, valor));
    arquivos.forEach(arquivo => dados.append('imagens', arquivo));
    try {
      await chamarApi(editando ? `/api/tipos-quarto/${editando.id}` : '/api/tipos-quarto', {
        method: editando ? 'PUT' : 'POST',
        body: dados,
      });
      fechar();
      await carregar();
    } catch (falha) {
      setErro(mensagem(falha));
    }
    setSalvando(false);
  }

  async function removerImagem(imagemId: number) {
    try {
      await chamarApi(`/api/tipos-quarto/imagens/${imagemId}`, { method: 'DELETE' });
      setEditando(atual => atual && { ...atual, imagens: atual.imagens.filter(i => i.id !== imagemId) });
      await carregar();
    } catch (falha) {
      setErro(mensagem(falha));
    }
  }

  async function excluir() {
    if (!excluindo) return;
    try {
      await chamarApi(`/api/tipos-quarto/${excluindo.id}`, { method: 'DELETE' });
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
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Categorias de Quartos</h1>
          <Button variant="primary" onClick={abrirNovo}>+ Novo tipo</Button>
        </div>

        {erro && !aberto && <Alert type="error" message={erro} onClose={() => setErro('')} />}

        <Card className="p-2">
          <Table
            loading={carregando}
            data={tipos}
            emptyMessage="Nenhum tipo de quarto cadastrado"
            columns={[
              {
                key: 'foto',
                header: 'Foto',
                render: tipo =>
                  tipo.imagens[0] ? (
                    <img src={tipo.imagens[0].url} alt={tipo.nome} className="w-16 h-11 object-cover rounded-lg" />
                  ) : (
                    <span className="text-xs text-slate-300">Sem foto</span>
                  ),
              },
              { key: 'nome', header: 'Nome', render: tipo => <span className="font-medium text-slate-800">{tipo.nome}</span> },
              { key: 'descricao', header: 'Descrição', render: tipo => <span className="text-slate-500">{tipo.descricao ?? ''}</span> },
              { key: 'preco', header: 'Diária', render: tipo => <span className="font-semibold text-[#B8963E]">{formatarMoeda(Number(tipo.preco_diaria))}</span> },
              { key: 'capacidade', header: 'Capacidade', render: tipo => `${tipo.capacidade_pessoas} pess.` },
              {
                key: 'acoes',
                header: 'Ações',
                render: tipo => (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(tipo)}>Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => setExcluindo(tipo)}>Excluir</Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>

      <Modal open={aberto} onClose={fechar} title={editando ? 'Editar tipo de quarto' : 'Novo tipo de quarto'}>
        <form onSubmit={salvar} className="space-y-4">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          <Input label="Nome" required value={formulario.nome} onChange={e => setFormulario({ ...formulario, nome: e.target.value })} />
          <Input label="Descrição" value={formulario.descricao} onChange={e => setFormulario({ ...formulario, descricao: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Diária (R$)"
              type="number"
              min="0"
              step="0.01"
              required
              value={formulario.preco_diaria}
              onChange={e => setFormulario({ ...formulario, preco_diaria: e.target.value })}
            />
            <Input
              label="Capacidade"
              type="number"
              min="1"
              required
              value={formulario.capacidade_pessoas}
              onChange={e => setFormulario({ ...formulario, capacidade_pessoas: e.target.value })}
            />
          </div>

          {editando && editando.imagens.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Imagens atuais</p>
              <div className="flex flex-wrap gap-3">
                {editando.imagens.map(imagem => (
                  <div key={imagem.id} className="relative">
                    <img src={imagem.url} alt={editando.nome} className="w-24 h-16 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removerImagem(imagem.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Novas imagens</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => setArquivos(Array.from(e.target.files ?? []))}
              className="text-sm text-slate-600"
            />
            <p className="text-xs text-slate-400">Até 8 imagens, 5 MB cada.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={fechar}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={salvando}>Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!excluindo} onClose={() => setExcluindo(null)} title="Excluir tipo de quarto" size="sm">
        <p className="text-sm text-slate-600 mb-5">
          Excluir o tipo {excluindo?.nome}? Só é possível se não houver quartos ou reservas vinculados.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setExcluindo(null)}>Cancelar</Button>
          <Button variant="danger" onClick={excluir}>Excluir</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default AdminCategoriesPage;