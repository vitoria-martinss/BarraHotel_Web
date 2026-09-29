const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome, papel: usuario.papel },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// Cadastro público — sempre cria papel "hospede"
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, telefone, documento } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios' });
  }

  try {
    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: 'Já existe uma conta com este e-mail' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, telefone, documento, papel) VALUES (?, ?, ?, ?, ?, "hospede")',
      [nome, email, senha_hash, telefone || null, documento || null]
    );

    const usuario = { id: resultado.insertId, nome, papel: 'hospede' };
    res.status(201).json({ token: gerarToken(usuario), usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar' });
  }
});

// Login — usado tanto na tela de hóspede quanto na de funcionário.
// Cada tela do front confere se o papel retornado é o esperado.
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });

  try {
    const [linhas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = linhas[0];

    if (!usuario || !usuario.senha_hash) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    const dadosUsuario = { id: usuario.id, nome: usuario.nome, papel: usuario.papel };
    res.json({ token: gerarToken(dadosUsuario), usuario: dadosUsuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao entrar' });
  }
});

module.exports = router;
