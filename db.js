const { Pool } = require('pg');
require('dotenv').config();

// Criamos um "Pool" (uma piscina de conexões) para falar com o banco
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Teste simples para ver se conectou
pool.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
  } else {
    console.log('Conectado ao banco de dados com sucesso!');
  }
});

module.exports = pool;