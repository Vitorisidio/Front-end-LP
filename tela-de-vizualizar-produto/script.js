'use strict';

const API_URL = 'http://localhost:8081/v1/vibecoffee/produto';

const params = new URLSearchParams(window.location.search);

const idProduto = Number(params.get('id'));
const tcIdInicial = Number(params.get('tcId'));

let categoriasProduto = [];

document.addEventListener('DOMContentLoaded', carregarProduto);

async function carregarProduto() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Erro ao buscar produtos');
        }

        const dados = await response.json();

        const produtos = dados.response.produto;

        const produto = produtos.find(
            item => Number(item.id) === idProduto
        );

        if (!produto) {

            document.getElementById('productTitle').textContent =
                'Produto não encontrado';

            return;
        }

        preencherTela(produto);

    } catch (error) {

        console.error(error);

        document.getElementById('productTitle').textContent =
            'Erro ao carregar produto';
    }
}

function preencherTela(produto) {

    document.getElementById('productTitle').textContent =
        produto.nome;

    document.getElementById('productDesc').textContent =
        produto.descricao;

    categoriasProduto =
        produto.tipo_categoria ?? [];

    atualizarStatus(produto.status);

    carregarImagem(produto.foto);

    criarTipos();
}

function criarTipos() {

    const tempRow =
        document.getElementById('tempRow');

    tempRow.replaceChildren();

    categoriasProduto.forEach((tipoCategoria, index) => {

        const button =
            document.createElement('button');

        button.classList.add('temp-btn');

        button.textContent =
            tipoCategoria.tipo;

        button.addEventListener('click', () => {

            document
                .querySelectorAll('.temp-btn')
                .forEach(btn =>
                    btn.classList.remove('active')
                );

            button.classList.add('active');

            document.getElementById('unitPrice').textContent =
                Number(tipoCategoria.preco)
                    .toLocaleString(
                        'pt-BR',
                        {
                            style: 'currency',
                            currency: 'BRL'
                        }
                    );
        });

        tempRow.appendChild(button);

        if (
            tcIdInicial &&
            Number(tipoCategoria.id) === tcIdInicial
        ) {
            setTimeout(() => button.click(), 0);
        }

        if (
            index === 0 &&
            !tcIdInicial
        ) {
            setTimeout(() => button.click(), 0);
        }
    });
}

function atualizarStatus(status) {

    const dot =
        document.getElementById('statusDot');

    const text =
        document.getElementById('statusText');

    if (
        status === true ||
        status === 1 ||
        status === '1'
    ) {

        dot.className =
            'status-dot available';

        text.className =
            'status-label available';

        text.textContent =
            'Disponível';

    } else {

        dot.className =
            'status-dot unavailable';

        text.className =
            'status-label unavailable';

        text.textContent =
            'Indisponível';
    }
}

function carregarImagem(nomeArquivo) {

    const img =
        document.getElementById('mainImg');

    img.src =
        nomeArquivo
            ? `img/${nomeArquivo}`
            : 'img/default.png';
}