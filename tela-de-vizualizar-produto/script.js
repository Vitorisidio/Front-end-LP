'use strict';

const API_URL =
    'http://localhost:8081/v1/vibecoffee/produto';

const params =
    new URLSearchParams(window.location.search);

const idProduto =
    Number(params.get('id'));

document.addEventListener(
    'DOMContentLoaded',
    carregarProduto
);

async function carregarProduto() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                'Erro ao buscar produtos'
            );
        }

        const dados =
            await response.json();

        const produtos =
            dados.response.produto;

        const produto =
            produtos.find(
                p => Number(p.id) === idProduto
            );

        if (!produto) {

            document.getElementById(
                'productTitle'
            ).textContent =
                'Produto não encontrado';

            return;
        }

        preencherTela(produto);

    } catch (erro) {

        console.error(
            'Erro:',
            erro
        );

        document.getElementById(
            'productTitle'
        ).textContent =
            'Erro ao carregar produto';
    }
}

function preencherTela(produto) {

    document.getElementById(
        'productTitle'
    ).textContent =
        produto.nome;

    document.getElementById(
        'productDesc'
    ).textContent =
        produto.descricao;

    const preco =
        produto.tipo_categoria?.[0]?.preco
        ?? 0;

    document.getElementById(
        'unitPrice'
    ).textContent =
        Number(preco)
        .toLocaleString(
            'pt-BR',
            {
                style: 'currency',
                currency: 'BRL'
            }
        );

    atualizarStatus(
        produto.status
    );

    configurarTipo(
        produto.tipo_categoria?.[0]?.id_tipo
    );

    carregarImagem(
        produto.foto
    );
}

function atualizarStatus(status) {

    const dot =
        document.getElementById(
            'statusDot'
        );

    const text =
        document.getElementById(
            'statusText'
        );

    if (Number(status) === 1) {

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

function configurarTipo(idTipo) {

    const quente =
        document.getElementById(
            'btnQuente'
        );

    const gelado =
        document.getElementById(
            'btnGelado'
        );

    quente.classList.remove(
        'active'
    );

    gelado.classList.remove(
        'active'
    );

    if (Number(idTipo) === 1) {
        quente.classList.add(
            'active'
        );
    }

    if (Number(idTipo) === 2) {
        gelado.classList.add(
            'active'
        );
    }
}

function carregarImagem(nomeArquivo) {

    const img =
        document.getElementById(
            'mainImg'
        );

    if (nomeArquivo) {

        img.src =
            `img/${nomeArquivo}`;

    } else {

        img.src =
            'img/default.png';
    }
}

function selectTemp(temp) {

    const quente =
        document.getElementById(
            'btnQuente'
        );

    const gelado =
        document.getElementById(
            'btnGelado'
        );

    quente.classList.toggle(
        'active',
        temp === 'quente'
    );

    gelado.classList.toggle(
        'active',
        temp === 'gelado'
    );
}