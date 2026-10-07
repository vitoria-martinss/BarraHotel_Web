import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { Button, Card, Alert, EmptyState, Input, Select } from '../ui';
import DashboardLayout from '../layouts/DashboardLayout';
import { GUEST_NAV } from '../config/navigation';
import { chamarApi, mensagemDeErro, type TipoQuarto } from '../services/api';
import { formatarMoeda, formatarData } from '../utils/formatters';

const PASSOS = ['Pesquisa', 'Disponibilidade', 'Confirmação'];

function dataLocal(data: Date) {
  return new Date(data.getTime() - data.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

function BookingPage({ initialRoomId }: { initialRoomId?: string }) {
  const { navigate } = useApp();
  const [passo, setPasso] = useState(1);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [hospedes, setHospedes] = useState('2');
  const [tipoFiltro, setTipoFiltro] = useState(initialRoomId ?? '');
  const [tipos, setTipos] = useState<TipoQuarto[]>([]);
  const [disponiveis, setDisponiveis] = useState<TipoQuarto[]>([]);
  const [escolhido, setEscolhido] = useState<TipoQuarto | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [reservaId, setReservaId] = useState<number | null>(null);

  useEffect(() => {
    chamarApi<TipoQuarto[]>('/api/tipos-quarto').then(setTipos).catch(falha => setErro(mensagemDeErro(falha)));
  }, []);

  const hoje = dataLocal(new Date());
  const noites =
    checkin && checkout ? Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000) : 0;

  async function pesquisar() {
    setCarregando(true);
    setErro('');
    try {
      const lista = await chamarApi<TipoQuarto[]>(`/api/tipos-quarto?checkin=${checkin}&checkout=${checkout}`);
      setDisponiveis(
        lista.filter(
          t =>
            (t.disponiveis ?? 0) > 0 &&
            t.capacidade_pessoas >= Number(hospedes) &&
            (!tipoFiltro || String(t.id) === tipoFiltro)
        )
      );
      setPasso(2);
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
    setCarregando(false);
  }

  async function confirmar() {
    if (!escolhido) return;
    setCarregando(true);
    setErro('');
    try {
      const resposta = await chamarApi<{ id: number }>('/api/reservas', {
        method: 'POST',
        body: JSON.stringify({ tipo_id: escolhido.id, data_checkin: checkin, data_checkout: checkout }),
      });
      setReservaId(resposta.id);
      setPasso(4);
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
    setCarregando(false);
  }

  return (
    <DashboardLayout title="Área do Hóspede" navItems={GUEST_NAV} area="guest">
      <div className="max-w-3xl mx-auto">
        {passo < 4 && (
          <div className="flex items-center gap-0 mb-8">
            {PASSOS.map((rotulo, i) => (
              <div key={rotulo} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 <= passo ? 'bg-[#1B2B4B] text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {i + 1}
                </div>
                <div className={`flex-1 h-0.5 ${i + 1 < passo ? 'bg-[#1B2B4B]' : 'bg-slate-200'} ${i === PASSOS.length - 1 ? 'hidden' : ''}`} />
                <span className={`hidden sm:block text-xs ml-1 mr-4 ${i + 1 === passo ? 'text-[#1B2B4B] font-semibold' : 'text-slate-400'}`}>{rotulo}</span>
              </div>
            ))}
          </div>
        )}

        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} className="mb-4" />}

        {passo === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-5" style={{ fontFamily: 'var(--font-display)' }}>Pesquisar disponibilidade</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Data de entrada" type="date" min={hoje} value={checkin} onChange={e => setCheckin(e.target.value)} />
              <Input label="Data de saída" type="date" min={checkin || hoje} value={checkout} onChange={e => setCheckout(e.target.value)} />
              <Select
                label="Quantidade de hóspedes"
                options={[1, 2, 3, 4].map(n => ({ value: String(n), label: `${n} hóspede${n > 1 ? 's' : ''}` }))}
                value={hospedes}
                onChange={e => setHospedes(e.target.value)}
              />
              <Select
                label="Tipo de quarto"
                options={[{ value: '', label: 'Qualquer tipo' }, ...tipos.map(t => ({ value: String(t.id), label: t.nome }))]}
                value={tipoFiltro}
                onChange={e => setTipoFiltro(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="primary" size="lg" onClick={pesquisar} loading={carregando} disabled={noites < 1}>
                Ver disponibilidade
              </Button>
            </div>
          </Card>
        )}

        {passo === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Quartos disponíveis</h2>
              <p className="text-sm text-slate-500">{disponiveis.length} resultado{disponiveis.length !== 1 ? 's' : ''}</p>
            </div>

            {disponiveis.length === 0 ? (
              <Card className="p-8">
                <EmptyState
                  title="Nenhum quarto disponível"
                  description="Tente alterar as datas, o número de hóspedes ou o tipo de quarto"
                  action={<Button variant="outline" onClick={() => setPasso(1)}>Alterar pesquisa</Button>}
                />
              </Card>
            ) : (
              disponiveis.map(tipo => (
                <Card key={tipo.id} className="p-5">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                      {tipo.imagens[0] && <img src={tipo.imagens[0].url} alt={tipo.nome} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>{tipo.nome}</h3>
                        <p className="text-sm text-slate-500 mt-1">{tipo.descricao}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Até {tipo.capacidade_pessoas} pessoas · {tipo.disponiveis} quarto{tipo.disponiveis !== 1 ? 's' : ''} livre{tipo.disponiveis !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-[#B8963E]">{formatarMoeda(Number(tipo.preco_diaria))}</p>
                        <p className="text-xs text-slate-400">/noite</p>
                        <p className="text-sm font-semibold text-slate-700 mt-1">{formatarMoeda(Number(tipo.preco_diaria) * noites)}</p>
                        <p className="text-xs text-slate-400">{noites} noite{noites > 1 ? 's' : ''}</p>
                        <Button variant="primary" size="sm" className="mt-2" onClick={() => { setEscolhido(tipo); setPasso(3); }}>
                          Selecionar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}

            {disponiveis.length > 0 && (
              <button onClick={() => setPasso(1)} className="text-sm text-slate-400 hover:text-slate-600">Alterar pesquisa</button>
            )}
          </div>
        )}

        {passo === 3 && escolhido && (
          <Card className="p-6 space-y-5">
            <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Revisão da reserva</h2>
            <div className="space-y-3 bg-slate-50 rounded-xl p-4">
              {[
                { rotulo: 'Quarto', valor: escolhido.nome },
                { rotulo: 'Check-in', valor: formatarData(checkin) },
                { rotulo: 'Check-out', valor: formatarData(checkout) },
                { rotulo: 'Noites', valor: String(noites) },
                { rotulo: 'Hóspedes', valor: hospedes },
                { rotulo: 'Valor por noite', valor: formatarMoeda(Number(escolhido.preco_diaria)) },
                { rotulo: 'Total', valor: formatarMoeda(Number(escolhido.preco_diaria) * noites) },
                { rotulo: 'Pagamento', valor: 'Na recepção' },
              ].map(item => (
                <div key={item.rotulo} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{item.rotulo}</span>
                  <span className="text-sm font-semibold text-slate-800">{item.valor}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPasso(2)} className="flex-1">Voltar</Button>
              <Button variant="secondary" onClick={confirmar} loading={carregando} className="flex-1">Confirmar reserva</Button>
            </div>
          </Card>
        )}

        {passo === 4 && (
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Reserva confirmada</h2>
            <p className="text-slate-500 mb-5">Sua reserva foi realizada com sucesso.</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-400">NÚMERO DA RESERVA</p>
              <p className="text-xl font-bold font-mono-data text-[#1B2B4B] mt-1">#{reservaId}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate({ id: 'my-reservations' })} className="flex-1">Ver minhas reservas</Button>
              <Button variant="primary" onClick={() => navigate({ id: 'guest-dashboard' })} className="flex-1">Voltar ao início</Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default BookingPage;