import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarTiposQuarto, BASE_URL } from '../api';
import Carousel from '../components/Carousel';

// TODO: trocar por fotos reais do hotel (fachada, piscina, área comum, café da manhã etc.)
// Basta colocar os arquivos em /public/hotel e trocar os caminhos abaixo,
// ex: '/hotel/fachada.jpg'
const IMAGENS_HOTEL = [
  '/hotel/barra.jpg',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1600&q=80',
];

export default function Landing() {
  const [tipos, setTipos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [buscou, setBuscou] = useState(false);

  async function carregar(comDatas = false) {
    setCarregando(true);
    try {
      const dados = comDatas ? await listarTiposQuarto(checkin, checkout) : await listarTiposQuarto();
      setTipos(dados);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function buscarDisponibilidade(e) {
    e.preventDefault();
    if (!checkin || !checkout) return;
    setBuscou(true);
    carregar(true);
  }

  return (
    <div className="pagina-landing">
      <section className="hero-carrossel">
        <Carousel imagens={IMAGENS_HOTEL} />

        <div className="hero-conteudo">
          <p className="rotulo-superior">Bem-vindo</p>
          <h1>Sua estadia começa aqui</h1>
          <p className="subtitulo">Conforto, tranquilidade e o melhor atendimento da região.</p>

          <form className="form-busca" onSubmit={buscarDisponibilidade}>
            <label>
              Check-in
              <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} required />
            </label>
            <label>
              Check-out
              <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} required />
            </label>
            <button type="submit">Ver disponibilidade</button>
          </form>
        </div>
      </section>

      <section className="secao-quartos pagina">
        <h2>Nossos quartos</h2>

        {carregando && <p className="mensagem">Carregando…</p>}

        <div className="grade-quartos">
          {tipos.map((tipo) => (
            <div className="cartao-quarto" key={tipo.id}>
              <div className="imagem-quarto">
                {tipo.imagens[0] ? (
                  <img src={`${BASE_URL}${tipo.imagens[0].url}`} alt={tipo.nome} />
                ) : (
                  <div className="imagem-vazia">Sem foto</div>
                )}
              </div>
              <div className="conteudo-cartao">
                <h3>{tipo.nome}</h3>
                <p className="descricao-quarto">{tipo.descricao}</p>
                <p className="capacidade">Acomoda até {tipo.capacidade_pessoas} pessoas</p>
                <div className="rodape-cartao">
                  <span className="preco">
                    R$ {Number(tipo.preco_diaria).toFixed(2)} <small>/ noite</small>
                  </span>
                  {buscou && (
                    <span className={`selo-disponibilidade ${tipo.disponiveis > 0 ? 'ok' : 'indisponivel'}`}>
                      {tipo.disponiveis > 0 ? `${tipo.disponiveis} disponíveis` : 'Indisponível'}
                    </span>
                  )}
                </div>
                <Link
                  className="botao-primario"
                  to={`/quartos/${tipo.id}${checkin && checkout ? `?checkin=${checkin}&checkout=${checkout}` : ''}`}
                >
                  Ver detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
