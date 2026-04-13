const express = require('express');
const router = express.Router();
const pool = require('../db');

// Rota para buscar todos os produtos (Roupas e Sapatos)
router.get('/', async (req, res) => {
    try {
        const produtos = await pool.query('SELECT * FROM produtos');
        res.json(produtos.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ erro: "Erro ao buscar produtos" });
    }
});

// Rota para cadastrar um novo produto (útil para você abastecer a loja)
router.post('/adicionar', async (req, res) => {
    const { nome, descricao, preco, tamanho, estoque, imagem_url } = req.body;
    try {
        const novoProduto = await pool.query(
            'INSERT INTO produtos (nome, descricao, preco, tamanho, estoque, imagem_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nome, descricao, preco, tamanho, estoque, imagem_url]
        );
        res.status(201).json(novoProduto.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ erro: "Erro ao adicionar produto" });
    }
});

module.exports = router;