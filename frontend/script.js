// Variável global para não precisar buscar no banco toda hora que filtrar
let produtosDoBanco = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    gerenciarLogin();
    configurarFormularios();
    atualizarVisualContador(); 
});

// 1. CARREGAR PRODUTOS
async function carregarProdutos() {
    const lista = document.getElementById('lista-produtos');
    if (!lista) return; 

    try {
        console.log("Buscando produtos da Pronto Look...");
        const resposta = await fetch('http://localhost:3000/produtos');
        produtosDoBanco = await resposta.json();
        
        exibirProdutos(produtosDoBanco);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

// FUNÇÃO ARRUMADA: Focada em limpar nomes de arquivos e evitar erros de carregamento
function exibirProdutos(listaParaExibir) {
    const lista = document.getElementById('lista-produtos');
    if (!lista) return; 
    
    lista.innerHTML = "";

    if (listaParaExibir.length === 0) {
        lista.innerHTML = "<p style='text-align:center; width:100%; grid-column: 1/-1;'>Nenhuma peça encontrada nessa categoria.</p>";
        return;
    }

    listaParaExibir.forEach(produto => {
        const idProduto = produto.id || produto.id_produto; 
        
        // Limpa espaços extras que podem vir do banco de dados
        let nomeImagem = produto.imagem_url ? produto.imagem_url.trim() : 'placeholder.png';
        
        // Se o nome da imagem no banco estiver com espaços (ex: "vestido amarelo.png")
        // O código abaixo troca o espaço por %20 para o navegador entender o link
        const nomeImagemSeguro = nomeImagem.replace(/ /g, '%20');

        // Garante que o caminho use a pasta assets/
        const imgPath = nomeImagemSeguro.startsWith('assets/') 
            ? nomeImagemSeguro 
            : `assets/${nomeImagemSeguro}`;

        lista.innerHTML += `
            <div class="produto-card">
                <div class="badge-desconto">-25%</div>
                <img src="${imgPath}" 
                     alt="${produto.nome}" 
                     onerror="this.onerror=null;this.src='assets/placeholder.png';">
                
                <div class="produto-info">
                    <h3>${produto.nome}</h3>
                    <div class="preco-container">
                        <span class="preco">R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}</span>
                        <span class="envio-nacional">Envio Nacional</span>
                    </div>
                    <button class="btn-comprar" onclick="adicionarAoCarrinho(event, ${idProduto})">
                        <i class="fas fa-cart-plus"></i> COMPRAR
                    </button>
                </div>
            </div>
        `;
    });
}

// 2. FUNÇÃO DE FILTRO
function filtrarPorCategoria(categoria) {
    document.querySelectorAll('.cat-item').forEach(btn => btn.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    }

    if (categoria === 'todos') {
        exibirProdutos(produtosDoBanco);
    } else {
        const filtrados = produtosDoBanco.filter(p => {
            const catProduto = (p.categoria || "").toLowerCase();
            const nomeProduto = p.nome.toLowerCase();
            return catProduto === categoria || nomeProduto.includes(categoria);
        });
        exibirProdutos(filtrados);
    }
}

// 3. GERENCIAR LOGIN
function gerenciarLogin() {
    const usuarioRaw = localStorage.getItem('usuarioLogado');
    const containerLogin = document.getElementById('login-links');
    const containerUser = document.getElementById('user-logged');
    const boasVindas = document.getElementById('boas-vindas');

    if (usuarioRaw && usuarioRaw !== "undefined") {
        const usuario = JSON.parse(usuarioRaw);
        if (boasVindas) boasVindas.innerText = `Olá, ${usuario.nome}!`;
        if (containerLogin) containerLogin.style.display = 'none';
        if (containerUser) containerUser.style.display = 'flex';
    } else {
        if (containerLogin) containerLogin.style.display = 'flex';
        if (containerUser) containerUser.style.display = 'none';
    }
}

// 4. ADICIONAR AO CARRINHO
async function adicionarAoCarrinho(event, produto_id) {
    const usuarioRaw = localStorage.getItem('usuarioLogado');
    
    if (!usuarioRaw || usuarioRaw === "undefined") {
        alert("Por favor, faça login para comprar.");
        window.location.href = "login.html";
        return;
    }

    const usuario = JSON.parse(usuarioRaw);
    const btn = event.currentTarget;
    const usuarioId = usuario.id || usuario.id_usuario;

    try {
        const resposta = await fetch('http://localhost:3000/carrinho/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usuario_id: usuarioId, 
                produto_id: produto_id,
                quantidade: 1 
            })
        });

        if (resposta.ok) {
            const conteúdoOriginal = btn.innerHTML;
            btn.innerHTML = "NO CARRINHO ✅";
            btn.classList.add('btn-sucesso'); 
            
            atualizarVisualContador();

            setTimeout(() => {
                btn.innerHTML = conteúdoOriginal;
                btn.classList.remove('btn-sucesso');
            }, 2000);
        }
    } catch (error) {
        console.error("Erro ao adicionar:", error);
    }
}

// 5. ATUALIZAR CONTADOR
async function atualizarVisualContador() {
    const contador = document.querySelector('.cart-count');
    const usuarioRaw = localStorage.getItem('usuarioLogado');
    
    if (!contador) return;
    if (!usuarioRaw || usuarioRaw === "undefined") {
        contador.innerText = "0";
        return;
    }

    const usuario = JSON.parse(usuarioRaw);
    const usuarioId = usuario.id || usuario.id_usuario;

    try {
        const res = await fetch(`http://localhost:3000/carrinho/${usuarioId}`);
        if (res.ok) {
            const itens = await res.json();
            contador.innerText = Array.isArray(itens) ? itens.length : 0;
        }
    } catch (err) {
        console.error("Erro no contador:", err);
    }
}

// 6. SAIR
function sair() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = "index.html";
}

// 7. FORMULÁRIOS (LOGIN/CADASTRO)
function configurarFormularios() {
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;
            const msg = document.getElementById('mensagem');

            try {
                const res = await fetch('http://localhost:3000/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                    window.location.href = "index.html";
                } else if (msg) {
                    msg.innerText = data.mensagem || "Erro no login";
                    msg.style.color = "red";
                }
            } catch (err) { console.error(err); }
        });
    }

    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;

            try {
                const res = await fetch('http://localhost:3000/usuarios/cadastro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha })
                });

                if (res.ok) {
                    alert("Bem-vinda à Pronto Look!");
                    window.location.href = "login.html";
                }
            } catch (err) { console.error(err); }
        });
    }
}