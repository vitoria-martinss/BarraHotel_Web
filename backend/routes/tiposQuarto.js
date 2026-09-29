const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { autenticar, exigirPapel } = require('../middleware/auth');

const router = express.Router();

const pastaUploads = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(pastaUploads)) fs.mkdirSync(pastaUploads);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pastaUploads),
  filename: (req, file, cb) => {
    const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, nomeUnico);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por imagem
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Só são aceitas imagens'));
    cb(null, true);
  },
});

async function buscarImagens(tipoId) {
  const [imagens] = await pool.query(
    'SELECT id, caminho_arquivo FROM imagens_tipo_quarto WHERE tipo_id = ?',
    [tipoId]
  );
  return imagens.map((i) => ({ id: i.id, url: `/uploads/${i.caminho_arquivo}` }));
}

// Pública — lista de tipos de quarto para a landing page.
// Se vier checkin/checkout na query, calcula quantos quartos daquele tipo estão livres no período.
router.get('/', async (req, res) => {
  const { checkin, checkout } = req.query;

  try {
    const [tipos] = await pool.query('SELECT * FROM tipos_quarto ORDER BY preco_diaria');

    const tiposComImagens = await Promise.all(
      tipos.map(async (tipo) => {
        const imagens = await buscarImagens(tipo.id);
        let disponiveis = null;

        if (checkin && checkout) {
          const [[{ total }]] = await pool.query(
            'SELECT COUNT(*) AS total FROM quartos WHERE tipo_id = ?',
            [tipo.id]
          );
          const [[{ ocupados }]] = await pool.query(
            `SELECT COUNT(DISTINCT quarto_id) AS ocupados
             FROM reservas r
             JOIN quartos q ON q.id = r.quarto_id
             WHERE q.tipo_id = ? AND r.status = 'confirmada'
               AND r.data_checkin < ? AND r.data_checkout > ?`,
            [tipo.id, checkout, checkin]
          );
          disponiveis = total - ocupados;
        }

        return { ...tipo, imagens, disponiveis };
      })
    );

    res.json(tiposComImagens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar tipos de quarto' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [linhas] = await pool.query('SELECT * FROM tipos_quarto WHERE id = ?', [req.params.id]);
    if (linhas.length === 0) return res.status(404).json({ erro: 'Tipo de quarto não encontrado' });

    const imagens = await buscarImagens(req.params.id);
    res.json({ ...linhas[0], imagens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar tipo de quarto' });
  }
});

// A partir daqui, só admin
router.use(autenticar, exigirPapel('admin'));

router.post('/', upload.array('imagens', 8), async (req, res) => {
  const { nome, descricao, preco_diaria, capacidade_pessoas } = req.body;
  if (!nome || !preco_diaria || !capacidade_pessoas) {
    return res.status(400).json({ erro: 'Nome, preço e capacidade são obrigatórios' });
  }

  try {
    const [resultado] = await pool.query(
      'INSERT INTO tipos_quarto (nome, descricao, preco_diaria, capacidade_pessoas) VALUES (?, ?, ?, ?)',
      [nome, descricao || null, preco_diaria, capacidade_pessoas]
    );

    const tipoId = resultado.insertId;
    if (req.files?.length) {
      for (const arquivo of req.files) {
        await pool.query('INSERT INTO imagens_tipo_quarto (tipo_id, caminho_arquivo) VALUES (?, ?)', [
          tipoId,
          arquivo.filename,
        ]);
      }
    }

    res.status(201).json({ id: tipoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar tipo de quarto' });
  }
});

router.put('/:id', upload.array('imagens', 8), async (req, res) => {
  const { nome, descricao, preco_diaria, capacidade_pessoas } = req.body;
  if (!nome || !preco_diaria || !capacidade_pessoas) {
    return res.status(400).json({ erro: 'Nome, preço e capacidade são obrigatórios' });
  }

  try {
    await pool.query(
      'UPDATE tipos_quarto SET nome=?, descricao=?, preco_diaria=?, capacidade_pessoas=? WHERE id=?',
      [nome, descricao || null, preco_diaria, capacidade_pessoas, req.params.id]
    );

    if (req.files?.length) {
      for (const arquivo of req.files) {
        await pool.query('INSERT INTO imagens_tipo_quarto (tipo_id, caminho_arquivo) VALUES (?, ?)', [
          req.params.id,
          arquivo.filename,
        ]);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar tipo de quarto' });
  }
});

router.delete('/imagens/:imagemId', async (req, res) => {
  try {
    const [linhas] = await pool.query('SELECT caminho_arquivo FROM imagens_tipo_quarto WHERE id = ?', [
      req.params.imagemId,
    ]);
    if (linhas[0]) {
      const caminho = path.join(pastaUploads, linhas[0].caminho_arquivo);
      fs.unlink(caminho, () => {});
    }
    await pool.query('DELETE FROM imagens_tipo_quarto WHERE id = ?', [req.params.imagemId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao apagar imagem' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tipos_quarto WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao apagar tipo de quarto (verifique se não há quartos ou reservas vinculadas)' });
  }
});

module.exports = router;
