import { useEffect, useState, useCallback } from 'react';

/**
 * Carrossel simples de imagens, com troca automática e navegação manual.
 *
 * Props:
 * - imagens: array de strings (URLs) das fotos a exibir
 * - intervalo: tempo em ms entre trocas automáticas (padrão 5000)
 */
export default function Carousel({ imagens = [], intervalo = 5000 }) {
  const [indiceAtual, setIndiceAtual] = useState(0);

  const proxima = useCallback(() => {
    setIndiceAtual((i) => (i + 1) % imagens.length);
  }, [imagens.length]);

  const anterior = useCallback(() => {
    setIndiceAtual((i) => (i - 1 + imagens.length) % imagens.length);
  }, [imagens.length]);

  useEffect(() => {
    if (imagens.length <= 1) return;
    const timer = setInterval(proxima, intervalo);
    return () => clearInterval(timer);
  }, [proxima, intervalo, imagens.length]);

  if (imagens.length === 0) return null;

  return (
    <div className="carrossel">
      <div className="carrossel-viewport">
        {imagens.map((url, i) => (
          <img
            key={url}
            src={url}
            alt={`Foto do hotel ${i + 1}`}
            className={`carrossel-imagem ${i === indiceAtual ? 'ativa' : ''}`}
          />
        ))}
      </div>

      {imagens.length > 1 && (
        <>
          <button
            className="carrossel-seta carrossel-seta-esquerda"
            onClick={anterior}
            aria-label="Imagem anterior"
            type="button"
          >
            ‹
          </button>
          <button
            className="carrossel-seta carrossel-seta-direita"
            onClick={proxima}
            aria-label="Próxima imagem"
            type="button"
          >
            ›
          </button>

          <div className="carrossel-indicadores">
            {imagens.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`carrossel-ponto ${i === indiceAtual ? 'ativo' : ''}`}
                aria-label={`Ir para imagem ${i + 1}`}
                onClick={() => setIndiceAtual(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
