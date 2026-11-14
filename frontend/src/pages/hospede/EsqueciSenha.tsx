import { useState } from "react";
import { useApp } from "../../store";
import { Button, Input, Alert } from "../../ui";
import PublicLayout from "../../layouts/PublicLayout";
import { chamarApi } from "@/services/api";

function EsqueciSenha() {
  const { navigate } = useApp();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      // Ajuste a rota para a que existir no backend.
      await chamarApi("/api/auth/esqueci-senha", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setEnviado(true);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível enviar o e-mail.");
    }
    setCarregando(false);
  }

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="text-center mb-6">
              <h1
                className="text-xl font-bold text-slate-800"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Recuperar senha
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Enviaremos um link para seu e-mail
              </p>
            </div>

            {enviado ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">
                  E-mail enviado!
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Verifique sua caixa de entrada em <strong>{email}</strong>
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate({ id: "login" })}
                  className="w-full"
                >
                  Voltar ao login
                </Button>
              </div>
            ) : (
              <form onSubmit={aoEnviar} className="space-y-4">
                {erro && <Alert type="error" message={erro} onClose={() => setErro("")} />}
                <Input
                  label="E-mail cadastrado"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  carregando={carregando}
                  className="w-full"
                >
                  Enviar link de recuperação
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate({ id: "login" })}
                  className="w-full"
                >
                  Voltar ao login
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default EsqueciSenha;
