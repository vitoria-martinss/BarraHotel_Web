import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LoginFuncionario() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { entrar } = useAuth();
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const { token, usuario } = await login(email, senha);
      if (usuario.papel === 'hospede') {
        setErro('Esta conta é de hóspede — use a tela de login normal.');
        return;
      }
      entrar(token, usuario);
      navigate(usuario.papel === 'admin' ? '/admin' : '/recepcao');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina pagina-estreita">
      <p className="rotulo-superior">Área restrita</p>
      <h1>Acesso da equipe</h1>
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
    </div>
  );
}
