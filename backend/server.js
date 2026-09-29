const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve as imagens dos quartos como arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tipos-quarto', require('./routes/tiposQuarto'));
app.use('/api/quartos', require('./routes/quartos'));
app.use('/api/reservas', require('./routes/reservas'));
app.use('/api/usuarios', require('./routes/usuarios'));

app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ erro: err.message || 'Erro inesperado' });
  }
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend do hotel rodando em http://localhost:${PORT}`);
});
