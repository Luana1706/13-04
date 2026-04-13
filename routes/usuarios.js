const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// 1. ROTA PARA CADASTRAR USUÁRIO
// POST http://localhost:3000/usuarios/cadastro
router.post('/cadastro', async (req, res) => {
    // Usamos .trim() para remover espaços acidentais que o usuário possa digitar
    const { nome, senha } = req.body;
    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "Por favor, preencha todos os campos." });
    }

    try {
        // Verifica se o e-mail já existe (usando LOWER para garantir)
        const checkEmail = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = $1', [email]);
        
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ mensagem: "Este e-mail já está cadastrado." });
        }

        const novoUsuario = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
            [nome, email, senha]
        );

        res.status(201).json({ 
            mensagem: "Usuário criado com sucesso!", 
            usuario: novoUsuario.rows[0] 
        });
    } catch (err) {
        console.error("Erro no Cadastro:", err.message);
        res.status(500).json({ mensagem: "Erro no servidor ao cadastrar usuário." });
    }
});

// 2. ROTA PARA FAZER LOGIN
// POST http://localhost:3000/usuarios/login
router.post('/login', async (req, res) => {
    const { senha } = req.body;
    // Forçamos o email a ficar em minúsculo para bater com o banco
    const email = req.body.email ? req.body.email.trim().toLowerCase() : null;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: "Preencha e-mail e senha." });
    }

    try {
        // Buscamos ignorando maiúsculas/minúsculas
        const resultado = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = $1', [email]);

        if (resultado.rows.length === 0) {
            // Se cair aqui, o erro 401 aparecerá no console do navegador
            return res.status(401).json({ mensagem: "E-mail não encontrado." });
        }

        const usuario = resultado.rows[0];

        // Verificação de senha
        if (usuario.senha !== senha) {
            return res.status(401).json({ mensagem: "Senha incorreta." });
        }

        // Retorno de sucesso
        res.json({ 
            mensagem: "Login realizado com sucesso!", 
            usuario: { 
                id: usuario.id, 
                nome: usuario.nome,
                email: usuario.email 
            } 
        });
    } catch (err) {
        console.error("Erro no Login:", err.message);
        res.status(500).json({ mensagem: "Erro no servidor ao tentar logar." });
    }
});

module.exports = router;