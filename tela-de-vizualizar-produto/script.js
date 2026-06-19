'use strict';

const API_URL = 'http://localhost:8081/v1/vibecoffee/produto';

const params = new URLSearchParams(window.location.search);
const idProduto = Number(params.get('id'));
const tcIdInicial = Number(params.get('tcId'));

let categoriasProduto = [];

document.addEventListener('DOMContentLoaded', carregarProduto);

async function carregarProduto() {
    try {
        // Se a sua API 8081 exigir token, pegamos do localStorage (igual no ADM)
        const token = localStorage.getItem('token'); 

        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['x-access-token'] = token; // Envia o token se ele existir
        }

        // Faz a requisição com os headers configurados para evitar o erro 401
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos: Status ${response.status}`);
        }

        const dados = await response.json();
        const produtos = dados.response.produto;

        const produto = produtos.find(
            item => Number(item.id) === idProduto
        );

        if (!produto) {
            document.getElementById('productTitle').textContent = 'Produto não encontrado';
            return;
        }

        preencherTela(produto);

    } catch (error) {
        console.error(error);
        document.getElementById('productTitle').textContent = 'Erro ao carregar produto';
    }
}

// O restante das funções (preencherTela, criarTipos, atualizarStatus, carregarImagem) 
// continua exatamente igual ao que ajustamos na mensagem anterior.

function preencherTela(produto) {
    // Adicione esta linha temporária para testar:
    console.log("DADOS DO PRODUTO VINDO DA API 8081:", produto);

    document.getElementById('productTitle').textContent = produto.nome;
    document.getElementById('productDesc').textContent = produto.descricao;

    categoriasProduto = produto.tipo_categoria ?? [];

    atualizarStatus(produto.status);
    carregarImagem(produto.foto); // <-- Veja se o nome do campo é 'foto' ou 'imagem'
    criarTipos();
}

function criarTipos() {
    const tempRow = document.getElementById('tempRow');
    tempRow.replaceChildren();

    categoriasProduto.forEach((tipoCategoria, index) => {
        const button = document.createElement('button');
        button.classList.add('temp-btn');
        
        // Correção de fallback para o nome do tipo
        button.textContent = tipoCategoria.tipo || tipoCategoria.nome_tipo || 'Padrão';

        button.addEventListener('click', () => {
            document.querySelectorAll('.temp-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            document.getElementById('unitPrice').textContent = Number(tipoCategoria.preco).toLocaleString(
                'pt-BR',
                { style: 'currency', currency: 'BRL' }
            );
        });

        tempRow.appendChild(button);

        if (tcIdInicial && Number(tipoCategoria.id) === tcIdInicial) {
            setTimeout(() => button.click(), 0);
        }

        if (index === 0 && !tcIdInicial) {
            setTimeout(() => button.click(), 0);
        }
    });
}

function atualizarStatus(status) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');

    if (status === true || status === 1 || status === '1') {
        dot.className = 'status-dot available';
        text.className = 'status-label available';
        text.textContent = 'Disponível';
    } else {
        dot.className = 'status-dot unavailable';
        text.className = 'status-label unavailable';
        text.textContent = 'Indisponível';
    }
}


function carregarImagem(nomeArquivo) {
    const img = document.getElementById('mainImg');
    
    // Se por acaso o script não achar a tag <img> no HTML, avisa no console
    if (!img) {
        console.error("Não foi possível encontrar o elemento com id 'mainImg' no seu HTML!");
        return;
    }

    if (!nomeArquivo) {
        img.src = 'img/default.png';
        return;
    }

    // Se começar com http ou https (Cloudinary), injeta a URL direta sem colocar 'img/' na frente
    if (nomeArquivo.startsWith('http://') || nomeArquivo.startsWith('https://')) {
        img.src = nomeArquivo;
    } else {
        // Se for o nome de arquivo antigo local (ex: 'foto.png'), usa a pasta local
        img.src = `img/${nomeArquivo}`;
    }

    // Caso a imagem falhe por qualquer outro motivo, coloca a imagem padrão
    img.onerror = function() {
        console.error("Falha física ao renderizar a imagem:", nomeArquivo);
        this.src = 'img/default.png';
    };
}