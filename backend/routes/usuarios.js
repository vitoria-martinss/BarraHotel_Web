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
      `SELECT u.id, u.nome, u.email, u.telefone, u.documento,
         u.senha_hash IS NOT NULL AS tem_login,
         (SELECT COUNT(*) FROM reservas r WHERE r.hospede_id = u.id) AS total_reservas
       FROM usuarios u
       WHERE u.papel = "hospede" AND (u.nome LIKE ? OR u.email LIKE ? OR u.documento LIKE ?)
       ORDER BY u.nome`,
      [busca, busca, busca]
    );
    res.json(
      linhas.map((l) => ({ ...l, tem_login: !!l.tem_login, total_reservas: Number(l.total_reservas) }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar hóspedes' });
  }
});

router.put('/hospedes/:id', async (req, res) => {
  const { nome, documento, telefone, email } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });

  try {
    const [resultado] = await pool.query(
      'UPDATE usuarios SET nome = ?, email = ?, documento = ?, telefone = ? WHERE id = ? AND papel = "hospede"',
      [nome, email || null, documento || null, telefone || null, req.params.id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Hóspede não encontrado' });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Já existe uma conta com este e-mail' });
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar hóspede' });
  }
});

router.delete('/hospedes/:id', exigirPapel('admin'), async (req, res) => {
  try {
    const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ? AND papel = "hospede"', [req.params.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Hóspede não encontrado' });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ erro: 'Este hóspede possui reservas e não pode ser excluído' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir hóspede' });
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

router.get('/funcionarios', exigirPapel('admin'), async (req, res) => {
  try {
    const [linhas] = await pool.query(
      `SELECT id, nome, email, papel, DATE_FORMAT(criado_em, '%Y-%m-%d') AS criado_em
       FROM usuarios
       WHERE papel IN ("admin", "recepcionista")
       ORDER BY nome`
    );
    res.json(linhas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar funcionários' });
  }
});

router.put('/funcionarios/:id', exigirPapel('admin'), async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { nome, email, senha, papel } = req.body;
  if (!nome || !email || !['admin', 'recepcionista'].includes(papel)) {
    return res.status(400).json({ erro: 'Nome, e-mail e papel (admin/recepcionista) são obrigatórios' });
  }
  if (Number(req.params.id) === req.usuario.id && papel !== req.usuario.papel) {
    return res.status(400).json({ erro: 'Você não pode alterar o próprio papel' });
  }

  try {
    const campos = ['nome = ?', 'email = ?', 'papel = ?'];
    const valores = [nome, email, papel];
    if (senha) {
      campos.push('senha_hash = ?');
      valores.push(await bcrypt.hash(senha, 10));
    }

    const [resultado] = await pool.query(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ? AND papel IN ("admin", "recepcionista")`,
      [...valores, req.params.id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Funcionário não encontrado' });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Já existe uma conta com este e-mail' });
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar funcionário' });
  }
});

router.delete('/funcionarios/:id', exigirPapel('admin'), async (req, res) => {
  if (Number(req.params.id) === req.usuario.id) {
    return res.status(400).json({ erro: 'Você não pode excluir a própria conta' });
  }

  try {
    const [resultado] = await pool.query(
      'DELETE FROM usuarios WHERE id = ? AND papel IN ("admin", "recepcionista")',
      [req.params.id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Funcionário não encontrado' });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ erro: 'Este funcionário criou reservas e não pode ser excluído' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir funcionário' });
  }
});

module.exports = router;