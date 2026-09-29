import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ocupacao, ListaReservas, NovaReserva, CadastrarHospede } from './PainelRecepcionista';
import {
  listarTiposQuarto,
  criarTipoQuarto,
  editarTipoQuarto,
  apagarTipoQuarto,
  apagarImagemTipoQuarto,
  listarQuartos,
  criarQuarto,
  apagarQuarto,
  cadastrarFuncionario,
  BASE_URL,
} from '../api';

const ABAS = ['Ocupação', 'Reservas', 'Nova reserva', 'Cadastrar hóspede', 'Tipos de quarto', 'Quartos', 'Funcionários'];

export default function PainelAdmin() {
  const { sessao } = useAuth();
  const [aba, setAba] = useState('Ocupação');

  return (
    <div className="pagina">
      <h1>Painel do administrador</h1>

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
      {aba === 'Tipos de quarto' && <TiposQuarto token={sessao.token} />}
      {aba === 'Quartos' && <QuartosFisicos token={sessao.token} />}
      {aba === 'Funcionários' && <Funcionarios token={sessao.token} />}
    </div>
  );
}

const TIPO_VAZIO = { nome: '', descricao: '', preco_diaria: '', capacidade_pessoas: '' };

function TiposQuarto({ token }) {
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState(null); // null = fechado, {} = novo, {id,...} = editando
  const [arquivos, setArquivos] = useState([]);
  const [mensagem, setMensagem] = useState(null);

  function carregar() {
    listarTiposQuarto().then(setTipos);
  }

  useEffect(carregar, []);

  async function salvar(e) {
    e.preventDefault();
    setMensagem(null);
    const dados = new FormData();
    dados.append('nome', form.nome);
    dados.append('descricao', form.descricao || '');
    dados.append('preco_diaria', form.preco_diaria);
    dados.append('capacidade_pessoas', form.capacidade_pessoas);
    arquivos.forEach((arquivo) => dados.append('imagens', arquivo));

    try {
      if (form.id) {
        await editarTipoQuarto(token, form.id, dados);
      } else {
        await criarTipoQuarto(token, dados);
      }
      setForm(null);
      setArquivos([]);
      carregar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  async function apagar(id) {
    if (!confirm('Apagar este tipo de quarto? Isso também remove os quartos físicos vinculados a ele.')) return;
    try {
      await apagarTipoQuarto(token, id);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  async function apagarImagem(imagemId) {
    await apagarImagemTipoQuarto(token, imagemId);
    carregar();
    if (form) buscarNovamente();
  }

  async function buscarNovamente() {
    const atualizado = tipos.find((t) => t.id === form.id);
    if (atualizado) setForm(atualizado);
  }

  return (
    <div>
      {!form && (
        <button className="botao-primario botao-inline" onClick={() => setForm({ ...TIPO_VAZIO })}>
          + novo tipo de quarto
        </button>
      )}

      {form && (
        <form className="form-vertical form-estreito" onSubmit={salvar}>
          <h3>{form.id ? 'Editar tipo de quarto' : 'Novo tipo de quarto'}</h3>
          <label>
            Nome
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </label>
          <label>
            Descrição
            <textarea
              rows={3}
              value={form.descricao || ''}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </label>
          <label>
            Preço por diária (R$)
            <input
              type="number"
              step="0.01"
              value={form.preco_diaria}
              onChange={(e) => setForm({ ...form, preco_diaria: e.target.value })}
              required
            />
          </label>
          <label>
            Capacidade (pessoas)
            <input
              type="number"
              value={form.capacidade_pessoas}
              onChange={(e) => setForm({ ...form, capacidade_pessoas: e.target.value })}
              required
            />
          </label>
          <label>
            Imagens {form.id ? '(adicionar mais)' : ''}
            <input type="file" multiple accept="image/*" onChange={(e) => setArquivos([...e.target.files])} />
          </label>

          {form.id && form.imagens?.length > 0 && (
            <div className="miniaturas">
              {form.imagens.map((img) => (
                <div className="miniatura" key={img.id}>
                  <img src={`${BASE_URL}${img.url}`} alt="" />
                  <button type="button" className="link" onClick={() => apagarImagem(img.id)}>remover</button>
                </div>
              ))}
            </div>
          )}

          {mensagem && <p className="erro">{mensagem.texto}</p>}
          <div className="acoes-form">
            <button type="button" className="link" onClick={() => { setForm(null); setArquivos([]); }}>
              cancelar
            </button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      )}

      <div className="grade-quartos admin">
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
              <p className="preco">R$ {Number(tipo.preco_diaria).toFixed(2)} <small>/ noite</small></p>
              <p className="capacidade">Até {tipo.capacidade_pessoas} pessoas</p>
              <div className="acoes">
                <button className="link" onClick={() => setForm(tipo)}>editar</button>
                <button className="link" onClick={() => apagar(tipo.id)}>apagar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuartosFisicos({ token }) {
  const [quartos, setQuartos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [novoNumero, setNovoNumero] = useState('');
  const [novoTipoId, setNovoTipoId] = useState('');
  const [mensagem, setMensagem] = useState(null);

  function carregar() {
    listarQuartos(token).then(setQuartos);
    listarTiposQuarto().then(setTipos);
  }

  useEffect(carregar, [token]);

  async function adicionar(e) {
    e.preventDefault();
    setMensagem(null);
    try {
      await criarQuarto(token, Number(novoTipoId), novoNumero);
      setNovoNumero('');
      setNovoTipoId('');
      carregar();
    } catch (e) {
      setMensagem(e.message);
    }
  }

  async function apagar(id) {
    if (!confirm('Apagar este quarto?')) return;
    try {
      await apagarQuarto(token, id);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div>
      <form className="form-linha" onSubmit={adicionar}>
        <select value={novoTipoId} onChange={(e) => setNovoTipoId(e.target.value)} required>
          <option value="">Tipo de quarto…</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
        <input
          placeholder="Número do quarto (ex: 104)"
          value={novoNumero}
          onChange={(e) => setNovoNumero(e.target.value)}
          required
        />
        <button type="submit">Adicionar quarto</button>
      </form>
      {mensagem && <p className="erro">{mensagem}</p>}

      <table className="tabela">
        <thead>
          <tr><th>Número</th><th>Tipo</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {quartos.map((q) => (
            <tr key={q.id}>
              <td>{q.numero}</td>
              <td>{q.tipo}</td>
              <td><button className="link" onClick={() => apagar(q.id)}>apagar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Funcionarios({ token }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', papel: 'recepcionista' });
  const [mensagem, setMensagem] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    setMensagem(null);
    try {
      await cadastrarFuncionario(token, form);
      setMensagem({ tipo: 'sucesso', texto: 'Funcionário cadastrado com sucesso.' });
      setForm({ nome: '', email: '', senha: '', papel: 'recepcionista' });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  return (
    <form className="form-vertical form-estreito" onSubmit={enviar}>
      <label>
        Nome
        <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
      </label>
      <label>
        E-mail
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      </label>
      <label>
        Senha provisória
        <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required minLength={6} />
      </label>
      <label>
        Papel
        <select value={form.papel} onChange={(e) => setForm({ ...form, papel: e.target.value })}>
          <option value="recepcionista">Recepcionista</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      {mensagem && <p className={mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}>{mensagem.texto}</p>}
      <button type="submit">Cadastrar funcionário</button>
    </form>
  );
}
