const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. Rota para ADICIONAR ou AUMENTAR quantidade
router.post('/adicionar', async (req, res) => {
    const { usuario_id, produto_id } = req.body;

    // Log para você ver no terminal se os dados estão chegando
    console.log(`Recebido pedido: Usuario ${usuario_id} quer o Produto ${produto_id}`);

    try {
        const existe = await pool.query(
            'SELECT * FROM carrinho WHERE usuario_id = $1 AND produto_id = $2',
            [usuario_id, produto_id]
        );

        if (existe.rows.length > 0) {
            console.log("Item já existe. Aumentando quantidade...");
            await pool.query(
                'UPDATE carrinho SET quantidade = quantidade + 1 WHERE id = $1',
                [existe.rows[0].id]
            );
        } else {
            console.log("Item novo. Inserindo no banco...");
            await pool.query(
                'INSERT INTO carrinho (usuario_id, produto_id, quantidade) VALUES ($1, $2, 1)',
                [usuario_id, produto_id]
            );
        }
        res.status(200).json({ mensagem: "Produto adicionado ao carrinho! 🎉" });
    } catch (err) {
        console.error("ERRO NO BANCO:", err.message);
        res.status(500).json({ erro: "Erro ao adicionar ao carrinho" });
    }
});

// 2. Rota para BUSCAR os itens (Usada na página carrinho.html)
router.get('/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const itens = await pool.query(
            `SELECT c.id, p.nome, p.preco, c.quantidade, p.imagem_url 
             FROM carrinho c 
             JOIN produtos p ON c.produto_id = p.id 
             WHERE c.usuario_id = $1`,
            [usuario_id]
        );
        res.json(itens.rows);
    } catch (err) {
        console.error("ERRO AO BUSCAR ITENS:", err.message);
        res.status(500).json({ erro: "Erro ao buscar itens do carrinho" });
    }
});

// 3. Rota para REMOVER um item do carrinho
router.delete('/remover/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM carrinho WHERE id = $1', [id]);
        res.json({ mensagem: "Item removido com sucesso!" });
    } catch (err) {
        console.error("ERRO AO REMOVER:", err.message);
        res.status(500).json({ erro: "Erro ao remover item" });
    }
});

module.exports = router;