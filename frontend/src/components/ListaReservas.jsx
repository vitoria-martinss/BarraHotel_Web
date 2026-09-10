function ListaReservas({ reservas }) {
    return (
        <section>
            <h2>Reservas</h2>

            {reservas.map((reserva) => (
                <div key={reserva.id_reserva}>
                    <h3>
                        Reserva #{reserva.id_reserva}
                    </h3>

                    <p>
                        Hóspede: {reserva.hospede_responsavel}
                    </p>

                    <p>
                        Check-in previsto: {reserva.check_in_previsto}
                    </p>

                    <p>
                        Check-out previsto: {reserva.check_out_previsto}
                    </p>

                    <p>
                        Status: {reserva.status}
                    </p>

                    <hr />
                </div>
            ))}
        </section>
    );
}

export default ListaReservas;