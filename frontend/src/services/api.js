const API_URL = "http://localhost:3000";

export async function buscarHospedes() {
    const resposta = await fetch(`${API_URL}/hospedes`);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar hóspedes");
    }

    return await resposta.json();
}

export async function cadastrarHospede(hospede) {
    const resposta = await fetch(`${API_URL}/hospedes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(hospede)
    });

    if (!resposta.ok) {
        throw new Error("Erro ao cadastrar hóspede");
    }

    return await resposta.json();
}
export async function buscarReservas() {
    const resposta = await fetch(`${API_URL}/reservas`);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar reservas");
    }

    return await resposta.json();
}