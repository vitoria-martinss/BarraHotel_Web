const express = require('express');
const pool = require('../db');
const { autenticar, exigirPapel } = require('../middleware/auth');

const router = express.Router();

function noites(checkin, checkout) {
  const ms = new Date(checkout) - new Date(checkin);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// Encontra um quarto livre daquele tipo no período (ou null se não houver)
async function acharQuartoLivre(tipoId, checkin, checkout) {
  const [quartos] = await pool.query(
    `SELECT q.id FROM quartos q
     WHERE q.tipo_id = ?
       AND q.id NOT IN (
         SELECT r.quarto_id FROM reservas r
         WHERE r.status = 'confirmada'
           AND r.data_checkin < ? AND r.data_checkout > ?
       )
     LIMIT 1`,
    [tipoId, checkout, checkin]
  );
  return quartos[0]?.id || null;
}

// Criar reserva.
// - Hóspede logado: cria para si mesmo.
// - Recepcionista/admin: cria em nome de um hospede_id informado no corpo.
router.post('/', autenticar, async (req, res) => {
  const { tipo_id, data_checkin, data_checkout, hospede_id } = req.body;

  if (!tipo_id || !data_checkin || !data_checkout) {
    return res.status(400).json({ erro: 'tipo_id, data_checkin e data_checkout são obrigatórios' });
  }
  if (new Date(data_checkout) <= new Date(data_checkin)) {
    return res.status(400).json({ erro: 'A data de checkout deve ser depois do checkin' });
  }

  const ehFuncionario = ['admin', 'recepcionista'].includes(req.usuario.papel);
  const hospedeFinal = ehFuncionario ? hospede_id : req.usuario.id;

  if (ehFuncionario && !hospede_id) {
    return res.status(400).json({ erro: 'Informe o hospede_id para criar a reserva' });
  }

  try {
    const [[tipo]] = await pool.query('SELECT preco_diaria FROM tipos_quarto WHERE id = ?', [tipo_id]);
    if (!tipo) return res.status(404).json({ erro: 'Tipo de quarto não encontrado' });

    const quartoId = await acharQuartoLivre(tipo_id, data_checkin, data_checkout);
    if (!quartoId) {
      return res.status(409).json({ erro: 'Não há quartos desse tipo disponíveis nesse período' });
    }

    const valorTotal = (noites(data_checkin, data_checkout) * Number(tipo.preco_diaria)).toFixed(2);

    const [resultado] = await pool.query(
      `INSERT INTO reservas (quarto_id, hospede_id, criado_por_id, data_checkin, data_checkout, valor_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [quartoId, hospedeFinal, ehFuncionario ? req.usuario.id : null, data_checkin, data_checkout, valorTotal]
    );

    res.status(201).json({ id: resultado.insertId, quarto_id: quartoId, valor_total: valorTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar reserva' });
  }
});

// Reservas do próprio hóspede logado
router.get('/minhas', autenticar, async (req, res) => {
  try {
    const [linhas] = await pool.query(
      `SELECT r.*, t.nome AS tipo_nome, q.numero AS quarto_numero
       FROM reservas r
       JOIN quartos q ON q.id = r.quarto_id
       JOIN tipos_quarto t ON t.id = q.tipo_id
       WHERE r.hospede_id = ?
       ORDER BY r.data_checkin DESC`,
      [req.usuario.id]
    );
    res.json(linhas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar suas reservas' });
  }
});

// Todas as reservas — uso da recepção/admin
router.get('/', autenticar, exigirPapel('admin', 'recepcionista'), async (req, res) => {
  try {
    const [linhas] = await pool.query(
      `SELECT r.*, t.nome AS tipo_nome, q.numero AS quarto_numero, u.nome AS hospede_nome
       FROM reservas r
       JOIN quartos q ON q.id = r.quarto_id
       JOIN tipos_quarto t ON t.id = q.tipo_id
       JOIN usuarios u ON u.id = r.hospede_id
       ORDER BY r.data_checkin DESC`
    );
    res.json(linhas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar reservas' });
  }
});

// Cancelar ou concluir uma reserva
router.put('/:id/status', autenticar, exigirPapel('admin', 'recepcionista'), async (req, res) => {
  const { status } = req.body;
  if (!['confirmada', 'cancelada', 'concluida'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido' });
  }
  try {
    await pool.query('UPDATE reservas SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar status da reserva' });
  }
});

// Marca pagamento como feito — SIMULADO, não passa por gateway nenhum
router.put('/:id/pagamento', autenticar, exigirPapel('admin', 'recepcionista'), async (req, res) => {
  try {
    await pool.query('UPDATE reservas SET pago = 1 WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao confirmar pagamento' });
  }
});

module.exports = router;
