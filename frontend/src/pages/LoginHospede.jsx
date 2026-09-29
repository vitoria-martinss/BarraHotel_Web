import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginHospede() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const { token, usuario } = await login(email, senha);
      if (usuario.papel !== 'hospede') {
        setErro('Esta conta é de funcionário — use o acesso da equipe.');
        return;
      }
      entrar(token, usuario);
      navigate(params.get('depois') || '/');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina pagina-estreita">
      <h1>Entrar</h1>
      <form className="form-vertical" onSubmit={enviar}>
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="ajuda">
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
      <p className="ajuda">
        É funcionário do hotel? <Link to="/funcionarios">Acesso da equipe</Link>
      </p>
    </div>
  );
}
