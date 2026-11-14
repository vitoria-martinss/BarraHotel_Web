import { ReactNode } from "react";
import { useApp, getUserAreaPage, type Page } from "../store";

import logo from "./images/logo.png";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { page, navigate, currentUser } = useApp();

  const pid = page.id;

  // Links de navegação do site
  const navLinks: { label: string; page: Page }[] = [
    { label: "Início", page: { id: "home" } },
    { label: "Quartos", page: { id: "rooms" } },
    { label: "Serviços", page: { id: "services" } },
    { label: "Sobre", page: { id: "about" } },
    { label: "Contato", page: { id: "contact" } },
  ];

  // Direciona para o cadastro ou para a reserva
  function fazerReserva() {
    if (!currentUser) {
      navigate({ id: "register" });
      return;
    }

    if (currentUser.type === "guest") {
      navigate({ id: "booking" });
      return;
    }

    // Funcionários e administradores não iniciam
    // reservas como hóspedes.
    navigate(getUserAreaPage(currentUser));
  }

  // Direciona para o login ou área do usuário
  function entrar() {
    if (!currentUser) {
      navigate({ id: "login" });
      return;
    }

    navigate(getUserAreaPage(currentUser));
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="bg-navy-800 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          <button
            onClick={() => navigate({ id: "home" })}
            className="flex items-center gap-2.5 group"
          >
            <img
              src={logo}
              alt="Barra Hotel"
              className="w-10 h-10 object-contain rounded-lg bg-white/5"
            />

            <div>
              <span
                className="font-bold text-lg tracking-wide"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Barra Hotel
              </span>

              <div className="h-0.5 w-0 group-hover:w-full bg-gold-500 transition-all duration-300" />
            </div>
          </button>


          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.page.id}
                onClick={() => navigate(link.page)}
                className={`text-sm font-medium transition-colors ${
                  pid === link.page.id
                    ? "text-gold-300"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>


          <div className="flex items-center gap-3">

            <button
              onClick={fazerReserva}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Fazer reserva
            </button>


            <button
              onClick={entrar}
              className="border border-gold-500 text-gold-300 hover:bg-gold-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      </header>


      <main className="flex-1">{children}</main>


      <footer className="bg-navy-900 text-slate-300 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="font-bold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Barra Hotel
                </span>
              </div>
            </div>


            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">
                Navegação
              </h4>

              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.page.id}>
                    <button
                      onClick={() => navigate(link.page)}
                      className="text-sm text-slate-400 hover:text-gold-300 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>


            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Contato</h4>

              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  Av. Manoel Gomes Casaca, Nº 111 - Vila Santana, Vargem Grande
                  do Sul/SP
                </li>

                <li>(19) 98448-7235</li>
                
                <li>(19) 3643-2943</li>

                <li>reservasbarrahotel@gmail.com</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">
                Institucional
              </h4>

              <ul className="space-y-2">
                {[
                  "Política de Privacidade",
                  "Termos de Uso",
                  "Trabalhe Conosco",
                  "Acessibilidade",
                ].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-slate-400 hover:text-gold-300 cursor-pointer transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>


          <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Todos os direitos reservados © 2026 Barra Hotel
            </p>

            <p className="text-xs text-slate-600">CNPJ 18.696.154/0001-25</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
