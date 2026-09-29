const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ erro: 'Não autenticado' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão inválida ou expirada' });
  }
}

// Uso: exigirPapel('admin') ou exigirPapel('admin', 'recepcionista')
function exigirPapel(...papeis) {
  return (req, res, next) => {
    if (!papeis.includes(req.usuario.papel)) {
      return res.status(403).json({ erro: 'Você não tem permissão para isso' });
    }
    next();
  };
}

module.exports = { autenticar, exigirPapel };
