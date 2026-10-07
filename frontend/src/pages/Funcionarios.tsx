import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { Button, Card, Table, SearchBar, Modal, Alert, Input, Select } from '../ui';
import DashboardLayout from '../layouts/DashboardLayout';
import { ADMIN_NAV } from '../config/navigation';
import { chamarApi, type Funcionario } from '../services/api';
import { formatarData } from '../utils/formatters';

type Formulario = { nome: string; email: string; papel: Funcionario['papel']; senha: string };

const formularioVazio: Formulario = { nome: '', email: '', papel: 'recepcionista', senha: '' };

const rotulos: Record<Funcionario['papel'], string> = {
  admin: 'Administrador',
  recepcionista: 'Recepcionista',
};

const cores: Record<Funcionario['papel'], string> = {
  admin: 'bg-red-100 text-red-700',
  recepcionista: 'bg-blue-100 text-blue-700',
};

const opcoesPapel = [
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'admin', label: 'Administrador' },
];

function mensagem(falha: unknown) {
  return falha instanceof Error ? falha.message : 'Erro inesperado';
}

function EmployeesPage() {
  const { currentUser } = useApp();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroPapel, setFiltroPapel] = useState('');
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Funcionario | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(formularioVazio);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<Funcionario | null>(null);

  async function carregar() {
    try {
      setFuncionarios(await chamarApi<Funcionario[]>('/api/usuarios/funcionarios'));
    } catch (falha) {
      setErro(mensagem(falha));
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = funcionarios.filter(f => {
    if (busca && !`${f.nome} ${f.email}`.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtroPapel && f.papel !== filtroPapel) return false;
    return true;
  });

  const ehVoce = (funcionario: Funcionario) => String(funcionario.id) === currentUser?.data.id;

  function abrirNovo() {
    setEditando(null);
    setFormulario(formularioVazio);
    setErro('');
    setAberto(true);
  }

  function abrirEdicao(funcionario: Funcionario) {
    setEditando(funcionario);
    setFormulario({ nome: funcionario.nome, email: funcionario.email, papel: funcionario.papel, senha: '' });
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
      await chamarApi(editando ? `/api/usuarios/funcionarios/${editando.id}` : '/api/usuarios/funcionarios', {
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
      await chamarApi(`/api/usuarios/funcionarios/${excluindo.id}`, { method: 'DELETE' });
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
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Gestão de Funcionários</h1>
          <Button variant="primary" onClick={abrirNovo}>+ Cadastrar funcionário</Button>
        </div>

        {erro && !aberto && <Alert type="error" message={erro} onClose={() => setErro('')} />}

        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(rotulos) as Funcionario['papel'][]).map(papel => {
            const ativo = filtroPapel === papel;
            const total = funcionarios.filter(f => f.papel === papel).length;
            return (
              <button
                key={papel}
                onClick={() => setFiltroPapel(ativo ? '' : papel)}
                className={`rounded-xl p-4 text-left border transition-all ${ativo ? 'border-[#1B2B4B] bg-[#1B2B4B] text-white' : 'bg-white border-slate-100 hover:border-slate-200'}`}
              >
                <p className={`text-2xl font-bold ${ativo ? 'text-white' : 'text-slate-800'}`}>{total}</p>
                <p className={`text-xs mt-0.5 ${ativo ? 'text-white/70' : 'text-slate-400'}`}>{rotulos[papel]}{total !== 1 ? 's' : ''}</p>
              </button>
            );
          })}
        </div>

        <Card className="p-5">
          <div className="flex gap-3 mb-5">
            <SearchBar value={busca} onChange={setBusca} className="flex-1 max-w-sm" />
          </div>

          <Table
            loading={carregando}
            data={filtrados}
            emptyMessage="Nenhum funcionário encontrado"
            columns={[
              {
                key: 'nome',
                header: 'Funcionário',
                render: f => (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0E1825] text-white text-sm font-bold flex items-center justify-center">{f.nome.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{f.nome}</p>
                      <p className="text-xs text-slate-400">{f.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'papel',
                header: 'Cargo',
                render: f => <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cores[f.papel]}`}>{rotulos[f.papel]}</span>,
              },
              { key: 'criado', header: 'Cadastro em', render: f => <span className="text-sm text-slate-400">{formatarData(f.criado_em)}</span> },
              {
                key: 'acoes',
                header: 'Ações',
                render: f => (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(f)}>Editar</Button>
                    <Button variant="danger" size="sm" disabled={ehVoce(f)} onClick={() => setExcluindo(f)}>Excluir</Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>

      <Modal open={aberto} onClose={fechar} title={editando ? 'Editar funcionário' : 'Cadastrar funcionário'}>
        <form onSubmit={salvar} className="space-y-4">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          <Input label="Nome completo" required value={formulario.nome} onChange={e => setFormulario({ ...formulario, nome: e.target.value })} />
          <Input label="E-mail" type="email" required value={formulario.email} onChange={e => setFormulario({ ...formulario, email: e.target.value })} />
          <Select
            label="Cargo"
            options={opcoesPapel}
            value={formulario.papel}
            disabled={!!editando && ehVoce(editando)}
            onChange={e => setFormulario({ ...formulario, papel: e.target.value as Funcionario['papel'] })}
          />
          <Input
            label={editando ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
            type="password"
            minLength={6}
            required={!editando}
            value={formulario.senha}
            onChange={e => setFormulario({ ...formulario, senha: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={fechar}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={salvando}>Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!excluindo} onClose={() => setExcluindo(null)} title="Excluir funcionário" size="sm">
        <p className="text-sm text-slate-600 mb-5">
          Excluir {excluindo?.nome}? Só é possível se o funcionário não tiver criado reservas.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setExcluindo(null)}>Cancelar</Button>
          <Button variant="danger" onClick={excluir}>Excluir</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default EmployeesPage;