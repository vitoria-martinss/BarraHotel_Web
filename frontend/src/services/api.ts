import type { Room } from "../data";

export async function chamarApi<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const ehFormData = opcoes.body instanceof FormData;
  const resposta = await fetch(caminho, {
    ...opcoes,
    headers: {
      ...(!ehFormData && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...opcoes.headers,
    },
  });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.erro ?? `Erro ${resposta.status}`);
  return corpo as T;
}

export type TipoQuarto = {
  id: number;
  nome: string;
  descricao: string | null;
  preco_diaria: string;
  capacidade_pessoas: number;
  imagens: { id: number; url: string }[];
  disponiveis?: number | null;
};

export type Reserva = {
  id: number;
  quarto_id: number;
  hospede_id: number;
  status: "confirmada" | "concluida" | "cancelada";
  pago: boolean;
  valor_total: number;
  data_checkin: string;
  data_checkout: string;
  criado_em: string;
  tipo_nome: string;
  quarto_numero: string;
  hospede_nome?: string;
};

export const rotulosStatus: Record<Reserva["status"], string> = {
  confirmada: "Confirmada",
  concluida: "Finalizada",
  cancelada: "Cancelada",
};

export function mensagemDeErro(falha: unknown) {
  return falha instanceof Error ? falha.message : "Erro inesperado";
}

export type Hospede = {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  documento: string | null;
  tem_login: boolean;
  total_reservas: number;
};

export type Funcionario = {
  id: number;
  nome: string;
  email: string;
  papel: "admin" | "recepcionista";
  criado_em: string;
};

export type QuartoFisico = {
  id: number;
  numero: string;
  tipo_id: number;
  tipo: string;
  preco_diaria: number;
  capacidade: number;
  ocupado: boolean;
  hospede: string | null;
  checkin: string | null;
  checkout: string | null;
};

export function tipoParaQuarto(tipo: TipoQuarto): Room {
  return {
    id: String(tipo.id),
    number: String(tipo.id),
    floor: 0,
    category: tipo.nome as Room["category"],
    subcategory: "" as Room["subcategory"],
    capacity: tipo.capacidade_pessoas,
    beds: 1,
    bedType: "",
    amenities: [],
    description: tipo.descricao ?? "",
    dailyRate: Number(tipo.preco_diaria),
    status: "Disponível",
    photo: tipo.imagens[0]?.url ?? "",
  };
}