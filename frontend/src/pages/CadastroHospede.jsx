import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cadastrarHospede } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CadastroHospede() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '' });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { entrar } = useAuth();
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const { token, usuario } = await cadastrarHospede(form);
      entrar(token, usuario);
      navigate('/');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina pagina-estreita">
      <h1>Criar conta</h1>
      <form className="form-vertical" onSubmit={enviar}>
        <label>
          Nome completo
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        </label>
        <label>
          E-mail
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Telefone
          <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            required
            minLength={6}
          />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Criando…' : 'Criar conta'}
        </button>
      </form>
      <p className="ajuda">
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </div>
  );
}
