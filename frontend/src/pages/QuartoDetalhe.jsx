import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { buscarTipoQuarto, criarReserva, BASE_URL } from '../api';
import { useAuth } from '../context/AuthContext';

export default function QuartoDetalhe() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { sessao } = useAuth();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState(null);
  const [checkin, setCheckin] = useState(params.get('checkin') || '');
  const [checkout, setCheckout] = useState(params.get('checkout') || '');
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    buscarTipoQuarto(id).then(setTipo);
  }, [id]);

  async function reservar(e) {
    e.preventDefault();
    setMensagem(null);

    if (!sessao) {
      navigate(`/entrar?depois=/quartos/${id}`);
      return;
    }

    setEnviando(true);
    try {
      const resultado = await criarReserva(sessao.token, {
        tipo_id: Number(id),
        data_checkin: checkin,
        data_checkout: checkout,
      });
      setMensagem({ tipo: 'sucesso', texto: `Reserva confirmada! Valor total: R$ ${resultado.valor_total}` });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setEnviando(false);
    }
  }

  if (!tipo) return <div className="pagina"><p className="mensagem">Carregando…</p></div>;

  return (
    <div className="pagina">
      <div className="detalhe-quarto">
        <div className="galeria">
          {tipo.imagens.length > 0 ? (
            tipo.imagens.map((img) => <img key={img.id} src={`${BASE_URL}${img.url}`} alt={tipo.nome} />)
          ) : (
            <div className="imagem-vazia grande">Sem fotos</div>
          )}
        </div>

        <div className="info-detalhe">
          <h1>{tipo.nome}</h1>
          <p className="descricao-quarto">{tipo.descricao}</p>
          <p className="capacidade">Acomoda até {tipo.capacidade_pessoas} pessoas</p>
          <p className="preco grande">R$ {Number(tipo.preco_diaria).toFixed(2)} <small>/ noite</small></p>

          <form className="form-reserva" onSubmit={reservar}>
            <label>
              Check-in
              <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} required />
            </label>
            <label>
              Check-out
              <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} required />
            </label>
            <button type="submit" disabled={enviando}>
              {enviando ? 'Reservando…' : sessao ? 'Confirmar reserva' : 'Entrar para reservar'}
            </button>
          </form>

          {mensagem && <p className={mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}>{mensagem.texto}</p>}
        </div>
      </div>
    </div>
  );
}
