// Roda uma vez, depois do npm install e do schema.sql:
//   npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@hotel.com';
  const senha = process.env.ADMIN_SENHA || 'admin123';

  const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existentes.length > 0) {
    console.log('Admin já existe, nada a fazer.');
    process.exit(0);
  }

  const senha_hash = await bcrypt.hash(senha, 10);
  await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)',
    ['Administrador', email, senha_hash, 'admin']
  );

  console.log(`Admin criado! Login: ${email} / Senha: ${senha}`);
  console.log('Recomendo trocar a senha depois de logar pela primeira vez.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
