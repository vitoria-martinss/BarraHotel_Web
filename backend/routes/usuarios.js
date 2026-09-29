const express = require('express');
const pool = require('../db');
const { autenticar, exigirPapel } = require('../middleware/auth');

const router = express.Router();

router.use(autenticar, exigirPapel('admin', 'recepcionista'));

// Cadastro de hóspede feito pela recepção (ex: pessoa idosa que não vai se cadastrar sozinha).
// Não tem senha — esse hóspede não faz login online, só existe como registro para reservas.
router.post('/hospedes', async (req, res) => {
  const { nome, documento, telefone, email } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });

  try {
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nome, email, documento, telefone, papel) VALUES (?, ?, ?, ?, "hospede")',
      [nome, email || null, documento || null, telefone || null]
    );
    res.status(201).json({ id: resultado.insertId, nome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar hóspede (e-mail já usado?)' });
  }
});

// Lista de hóspedes, para escolher ao criar uma reserva manual
router.get('/hospedes', async (req, res) => {
  const busca = req.query.busca ? `%${req.query.busca}%` : '%';
  try {
    const [linhas] = await pool.query(
      'SELECT id, nome, email, telefone, documento FROM usuarios WHERE papel = "hospede" AND nome LIKE ? ORDER BY nome LIMIT 50',
      [busca]
    );
    res.json(linhas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar hóspedes' });
  }
});

// Recepcionistas só podem ser criados por um admin
router.post('/funcionarios', exigirPapel('admin'), async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { nome, email, senha, papel } = req.body;
  if (!nome || !email || !senha || !['admin', 'recepcionista'].includes(papel)) {
    return res.status(400).json({ erro: 'Nome, e-mail, senha e papel (admin/recepcionista) são obrigatórios' });
  }

  try {
    const senha_hash = await bcrypt.hash(senha, 10);
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)',
      [nome, email, senha_hash, papel]
    );
    res.status(201).json({ id: resultado.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar funcionário (e-mail já usado?)' });
  }
});

module.exports = router;
