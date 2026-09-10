function ListaHospedes({ hospedes }) {

    return (
        <section>

            <h2>Hóspedes cadastrados</h2>

            {hospedes.map((hospede) => (

                <div key={hospede.id_hospede}>

                    <h3>{hospede.nome}</h3>

                    <p>E-mail: {hospede.email}</p>

                    <p>Telefone: {hospede.telefone}</p>

                    <p>Documento: {hospede.documento}</p>

                    <hr />

                </div>

            ))}

        </section>
    );
}

export default ListaHospedes;