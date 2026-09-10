import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Hospedes from "./pages/Hospedes";
import Reservas from "./pages/Reservas";

function App() {

    return (
        <BrowserRouter>

            <nav>

                <Link to="/">
                    Início
                </Link>

                {" | "}

                <Link to="/hospedes">
                    Hóspedes
                </Link>

                {" | "}

                <Link to="/reservas">
                    Reservas
                </Link>

            </nav>

            <hr />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/hospedes"
                    element={<Hospedes />}
                />

                <Route
                    path="/reservas"
                    element={<Reservas />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;