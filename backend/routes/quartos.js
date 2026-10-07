const express = require('express');
const pool = require('../db');
const { autenticar, exigirPapel } = require('../middleware/auth');

const router = express.Router();

// Tudo aqui é uso interno (recepção/admin)
router.use(autenticar, exigirPapel('admin', 'recepcionista'));

// Lista todos os quartos físicos com status de ocupação HOJE e por quem
router.get('/', async (req, res) => {
  try {
    const [linhas] = await pool.query(`
      SELECT
        q.id, q.numero, q.tipo_id, t.nome AS tipo_nome, t.preco_diaria, t.capacidade_pessoas,
        r.id AS reserva_id,
        DATE_FORMAT(r.data_checkin, '%Y-%m-%d') AS data_checkin,
        DATE_FORMAT(r.data_checkout, '%Y-%m-%d') AS data_checkout,
        u.nome AS hospede_nome
      FROM quartos q
      JOIN tipos_quarto t ON t.id = q.tipo_id
      LEFT JOIN reservas r ON r.quarto_id = q.id
        AND r.status = 'confirmada'
        AND CURDATE() >= r.data_checkin AND CURDATE() < r.data_checkout
      LEFT JOIN usuarios u ON u.id = r.hospede_id
      ORDER BY q.numero
    `);

    const quartos = linhas.map((l) => ({
      id: l.id,
      numero: l.numero,
      tipo_id: l.tipo_id,
      tipo: l.tipo_nome,
      preco_diaria: Number(l.preco_diaria),
      capacidade: l.capacidade_pessoas,
      ocupado: !!l.reserva_id,
      hospede: l.hospede_nome || null,
      checkin: l.data_checkin || null,
      checkout: l.data_checkout || null,
    }));

    res.json(quartos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar quartos' });
  }
});

// Cadastrar um novo quarto físico — só admin
router.post('/', exigirPapel('admin'), async (req, res) => {
  const { tipo_id, numero } = req.body;
  if (!tipo_id || !numero) return res.status(400).json({ erro: 'tipo_id e numero são obrigatórios' });

  try {
    const [resultado] = await pool.query('INSERT INTO quartos (tipo_id, numero) VALUES (?, ?)', [
      tipo_id,
      numero,
    ]);
    res.status(201).json({ id: resultado.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar quarto (número já existe?)' });
  }
});

router.put('/:id', exigirPapel('admin'), async (req, res) => {
  const { tipo_id, numero } = req.body;
  if (!tipo_id || !numero) return res.status(400).json({ erro: 'tipo_id e numero são obrigatórios' });

  try {
    const [resultado] = await pool.query('UPDATE quartos SET tipo_id = ?, numero = ? WHERE id = ?', [
      tipo_id,
      numero,
      req.params.id,
    ]);
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Quarto não encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar quarto (número já existe?)' });
  }
});

router.delete('/:id', exigirPapel('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM quartos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao apagar quarto (verifique se não há reservas vinculadas)' });
  }
});

module.exports = router;