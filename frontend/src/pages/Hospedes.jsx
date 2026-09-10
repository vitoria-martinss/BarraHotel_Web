import { useEffect, useState } from "react";

import FormularioHospede from "../components/FormularioHospedes";
import ListaHospedes from "../components/ListaHospedes";

import {
    buscarHospedes,
    cadastrarHospede
} from "../services/api";

function Hospedes() {

    const [hospedes, setHospedes] = useState([]);

    async function carregarHospedes() {

        try {

            const dados = await buscarHospedes();

            setHospedes(dados);

        } catch (erro) {

            console.error("Erro ao carregar hóspedes:", erro);
        }
    }

    useEffect(() => {
        carregarHospedes();
    }, []);

    async function adicionarHospede(novoHospede) {

        await cadastrarHospede(novoHospede);

        await carregarHospedes();
    }

    return (
        <div>

            <h1>Hóspedes</h1>

            <FormularioHospede
                aoCadastrar={adicionarHospede}
            />

            <ListaHospedes
                hospedes={hospedes}
            />

        </div>
    );
}

export default Hospedes;