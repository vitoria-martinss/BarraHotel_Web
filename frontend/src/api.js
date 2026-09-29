const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function tratarResposta(res) {
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.erro || 'Erro na requisição');
  return dados;
}

function cabecalhos(token, comJson = true) {
  const h = {};
  if (comJson) h['Content-Type'] = 'application/json';
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

// --- Autenticação ---
export async function cadastrarHospede(dados) {
  const res = await fetch(`${BASE_URL}/api/auth/cadastro`, {
    method: 'POST',
    headers: cabecalhos(),
    body: JSON.stringify(dados),
  });
  return tratarResposta(res);
}

export async function login(email, senha) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: cabecalhos(),
    body: JSON.stringify({ email, senha }),
  });
  return tratarResposta(res);
}

// --- Tipos de quarto ---
export async function listarTiposQuarto(checkin, checkout) {
  const params = checkin && checkout ? `?checkin=${checkin}&checkout=${checkout}` : '';
  const res = await fetch(`${BASE_URL}/api/tipos-quarto${params}`);
  return tratarResposta(res);
}

export async function buscarTipoQuarto(id) {
  const res = await fetch(`${BASE_URL}/api/tipos-quarto/${id}`);
  return tratarResposta(res);
}

export async function criarTipoQuarto(token, formData) {
  const res = await fetch(`${BASE_URL}/api/tipos-quarto`, {
    method: 'POST',
    headers: cabecalhos(token, false),
    body: formData,
  });
  return tratarResposta(res);
}

export async function editarTipoQuarto(token, id, formData) {
  const res = await fetch(`${BASE_URL}/api/tipos-quarto/${id}`, {
    method: 'PUT',
    headers: cabecalhos(token, false),
    body: formData,
  });
  return tratarResposta(res);
}

export async function apagarTipoQuarto(token, id) {
  const res = await fetch(`${BASE_URL}/api/tipos-quarto/${id}`, {
    method: 'DELETE',
    headers: cabecalhos(token, false),
  });
  return tratarResposta(res);
}

export async function apagarImagemTipoQuarto(token, imagemId) {
  const res = await fetch(`${BASE_URL}/api/tipos-quarto/imagens/${imagemId}`, {
    method: 'DELETE',
    headers: cabecalhos(token, false),
  });
  return tratarResposta(res);
}

// --- Quartos físicos ---
export async function listarQuartos(token) {
  const res = await fetch(`${BASE_URL}/api/quartos`, { headers: cabecalhos(token, false) });
  return tratarResposta(res);
}

export async function criarQuarto(token, tipo_id, numero) {
  const res = await fetch(`${BASE_URL}/api/quartos`, {
    method: 'POST',
    headers: cabecalhos(token),
    body: JSON.stringify({ tipo_id, numero }),
  });
  return tratarResposta(res);
}

export async function apagarQuarto(token, id) {
  const res = await fetch(`${BASE_URL}/api/quartos/${id}`, {
    method: 'DELETE',
    headers: cabecalhos(token, false),
  });
  return tratarResposta(res);
}

// --- Hóspedes (cadastro manual pela recepção) ---
export async function listarHospedes(token, busca = '') {
  const res = await fetch(`${BASE_URL}/api/usuarios/hospedes?busca=${encodeURIComponent(busca)}`, {
    headers: cabecalhos(token, false),
  });
  return tratarResposta(res);
}

export async function cadastrarHospedeManual(token, dados) {
  const res = await fetch(`${BASE_URL}/api/usuarios/hospedes`, {
    method: 'POST',
    headers: cabecalhos(token),
    body: JSON.stringify(dados),
  });
  return tratarResposta(res);
}

export async function cadastrarFuncionario(token, dados) {
  const res = await fetch(`${BASE_URL}/api/usuarios/funcionarios`, {
    method: 'POST',
    headers: cabecalhos(token),
    body: JSON.stringify(dados),
  });
  return tratarResposta(res);
}

// --- Reservas ---
export async function criarReserva(token, dados) {
  const res = await fetch(`${BASE_URL}/api/reservas`, {
    method: 'POST',
    headers: cabecalhos(token),
    body: JSON.stringify(dados),
  });
  return tratarResposta(res);
}

export async function minhasReservas(token) {
  const res = await fetch(`${BASE_URL}/api/reservas/minhas`, { headers: cabecalhos(token, false) });
  return tratarResposta(res);
}

export async function todasReservas(token) {
  const res = await fetch(`${BASE_URL}/api/reservas`, { headers: cabecalhos(token, false) });
  return tratarResposta(res);
}

export async function atualizarStatusReserva(token, id, status) {
  const res = await fetch(`${BASE_URL}/api/reservas/${id}/status`, {
    method: 'PUT',
    headers: cabecalhos(token),
    body: JSON.stringify({ status }),
  });
  return tratarResposta(res);
}

export async function confirmarPagamento(token, id) {
  const res = await fetch(`${BASE_URL}/api/reservas/${id}/pagamento`, {
    method: 'PUT',
    headers: cabecalhos(token, false),
  });
  return tratarResposta(res);
}

export { BASE_URL };
