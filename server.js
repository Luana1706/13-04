const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Banco
const pool = require('./db');

// Rotas
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');
const carrinhoRoutes = require('./routes/carrinho');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// 🔥 Servir frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/usuarios', usuariosRoutes);
app.use('/produtos', produtosRoutes);
app.use('/carrinho', carrinhoRoutes);

// 🔥 Rota principal agora abre o site
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});