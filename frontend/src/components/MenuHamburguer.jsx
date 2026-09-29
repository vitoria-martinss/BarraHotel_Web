import { useEffect, useState } from 'react';

/**
 * Botão hambúrguer + painel deslizante.
 * Recebe os links de navegação como children — quem decide QUAIS links
 * aparecem (login, cadastro, painel etc.) continua sendo o App.jsx,
 * este componente só cuida de mostrar/esconder.
 */
export default function MenuHamburguer({ children }) {
  const [aberto, setAberto] = useState(false);

  // Fecha o menu automaticamente se a pessoa clicar em algum link lá dentro
  function fecharAoClicar(e) {
    if (e.target.closest('a, button')) {
      setAberto(false);
    }
  }

  // Trava o scroll da página enquanto o menu está aberto
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  return (
    <>
      <button
        className={`botao-hamburguer ${aberto ? 'aberto' : ''}`}
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={aberto}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      {aberto && <div className="overlay-menu" onClick={() => setAberto(false)} />}

      <div className={`painel-menu ${aberto ? 'aberto' : ''}`} onClick={fecharAoClicar}>
        {children}
      </div>
    </>
  );
}
