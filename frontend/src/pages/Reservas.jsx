import { useEffect, useState } from "react";

import ListaReservas from "../components/ListaReservas";

import { buscarReservas } from "../services/api";

function Reservas() {
    const [reservas, setReservas] = useState([]);

    useEffect(() => {
        async function carregarReservas() {
            try {
                const dados = await buscarReservas();

                setReservas(dados);
            } catch (erro) {
                console.error(
                    "Erro ao carregar reservas:",
                    erro
                );
            }
        }

        carregarReservas();
    }, []);

    return (
        <div>
            <h1>Reservas</h1>

            <ListaReservas
                reservas={reservas}
            />
        </div>
    );
}

export default Reservas;