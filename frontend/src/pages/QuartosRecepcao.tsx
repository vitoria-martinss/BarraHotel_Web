import { useEffect, useState } from 'react';
import { Badge, Modal, SearchBar, Alert } from '../ui';
import DashboardLayout from '../layouts/DashboardLayout';
import { STAFF_NAV } from '../config/navigation';
import { chamarApi, type QuartoFisico } from '../services/api';
import { formatarMoeda, formatarData } from '../utils/formatters';

const situacoes = ['Disponível', 'Ocupado'];

function situacaoDe(quarto: QuartoFisico) {
  return quarto.ocupado ? 'Ocupado' : 'Disponível';
}

function StaffRoomsPage() {
  const [quartos, setQuartos] = useState<QuartoFisico[]>([]);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [situacao, setSituacao] = useState('');
  const [selecionado, setSelecionado] = useState<QuartoFisico | null>(null);

  useEffect(() => {
    chamarApi<QuartoFisico[]>('/api/quartos')
      .then(setQuartos)
      .catch(falha => setErro(falha instanceof Error ? falha.message : 'Erro inesperado'));
  }, []);

  const filtrados = quartos.filter(q => {
    if (busca && !`${q.numero} ${q.tipo}`.toLowerCase().includes(busca.toLowerCase())) return false;
    if (situacao && situacaoDe(q) !== situacao) return false;
    return true;
  });

  const botao = (ativo: boolean) =>
    `px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${ativo ? 'bg-[#1B2B4B] text-white border-[#1B2B4B]' : 'bg-white text-slate-600 border-slate-200'}`;

  return (
    <DashboardLayout title="Área de Funcionários" navItems={STAFF_NAV} area="staff">
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Quartos</h1>

        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSituacao('')} className={botao(!situacao)}>Todos ({quartos.length})</button>
          {situacoes.map(s => (
            <button key={s} onClick={() => setSituacao(s)} className={botao(situacao === s)}>
              {s} ({quartos.filter(q => situacaoDe(q) === s).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <SearchBar value={busca} onChange={setBusca} className="max-w-xs" />
          <span className="text-sm text-slate-400">{filtrados.length} quartos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtrados.map(quarto => (
            <div
              key={quarto.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4"
              onClick={() => setSelecionado(quarto)}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-slate-800">Quarto {quarto.numero}</p>
                <Badge label={situacaoDe(quarto)} />
              </div>
              <p className="text-sm text-slate-500">{quarto.tipo}</p>
              {quarto.hospede && <p className="text-xs text-slate-400 mt-1">{quarto.hospede}</p>}
              <div className="flex justify-between mt-3">
                <span className="text-xs text-slate-500">{quarto.capacidade} pess.</span>
                <span className="text-sm font-bold text-[#B8963E]">{formatarMoeda(quarto.preco_diaria)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={!!selecionado} onClose={() => setSelecionado(null)} title={`Quarto ${selecionado?.numero}`} size="sm">
        {selecionado && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{selecionado.tipo}</h3>
              <Badge label={situacaoDe(selecionado)} />
            </div>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3">
              <div>
                <p className="text-xs text-slate-400">Capacidade</p>
                <p className="font-semibold">{selecionado.capacidade} pess.</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Diária</p>
                <p className="font-semibold text-[#B8963E]">{formatarMoeda(selecionado.preco_diaria)}</p>
              </div>
            </div>
            {selecionado.ocupado && selecionado.checkin && selecionado.checkout && (
              <div className="text-sm text-slate-600 space-y-1">
                <p>Hóspede: <span className="font-medium">{selecionado.hospede}</span></p>
                <p>Check-in: {formatarData(selecionado.checkin)}</p>
                <p>Check-out: {formatarData(selecionado.checkout)}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default StaffRoomsPage;