document.addEventListener('DOMContentLoaded', () => {
    carregarItensCarrinho();
});

async function carregarItensCarrinho() {
    const usuarioRaw = localStorage.getItem('usuarioLogado');
    if (!usuarioRaw) {
        window.location.href = "login.html";
        return;
    }

    const usuario = JSON.parse(usuarioRaw);
    const container = document.getElementById('lista-carrinho');
    const totalElemento = document.getElementById('total-carrinho');

    try {
        // Busca os itens do banco de dados
        const resposta = await fetch(`http://localhost:3000/carrinho/${usuario.id}`);
        const itens = await resposta.json();

        if (itens.length === 0) {
            container.innerHTML = "<p>Seu carrinho está vazio. 🛍️</p>";
            totalElemento.innerText = "0,00";
            return;
        }

        container.innerHTML = "";
        let totalGeral = 0;

        itens.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            totalGeral += subtotal;

            container.innerHTML += `
                <div class="item-carrinho">
                    <div class="info">
                        <h4>${item.nome}</h4>
                        <p>Quantidade: ${item.quantidade}</p>
                        <p>Preço unitário: R$ ${item.preco}</p>
                    </div>
                    <div class="preco-subtotal">
                        <span>R$ ${subtotal.toFixed(2)}</span>
                        <button class="btn-remover" onclick="removerItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        totalElemento.innerText = totalGeral.toFixed(2);

    } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
    }
}

// Função para remover item
// Função para remover item sem o alerta de confirmação
async function removerItem(carrinhoId) {
    try {
        const resposta = await fetch(`http://localhost:3000/carrinho/remover/${carrinhoId}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            console.log("Item removido com sucesso!");
            // Recarrega a lista automaticamente para o item sumir da tela
            carregarItensCarrinho(); 
        } else {
            console.error("Erro ao tentar remover o item do banco.");
        }
    } catch (error) {
        console.error("Erro de conexão ao remover item:", error);
    }
}
