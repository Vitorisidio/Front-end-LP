'use strict';

// Ativa o modo estrito do JavaScript
// Ajuda a evitar alguns erros comuns
// ======================================================
// ENDEREÇOS DAS APIS
// ======================================================

// API que devolve os produtos
const API_PRODUTOS = 'http://localhost:8081/v1/vibecoffee/produto';

// API que devolve as categorias
const API_CATEGORIAS = 'http://localhost:8081/v1/vibecoffee/categoria';


// ======================================================
// ELEMENTOS DO HTML
// ======================================================

// Menu onde serão criados os botões das categorias
const menu = document.querySelector('.menu');

// Container onde os cards dos produtos serão exibidos
const containerCard = document.querySelector('.container-card');

// Botão "Ver Mais"
const botaoVerTudo = document.getElementById('ver-tudo');

// Seta da esquerda
const setaEsquerda = document.getElementById('seta-esquerda');

// Seta da direita
const setaDireita = document.getElementById('seta-direita');


// ======================================================
// VARIÁVEIS DO SISTEMA
// ======================================================

// Guarda todas as categorias vindas da API
let todasCategorias = [];

// Guarda todos os produtos vindos da API
let todosProdutos = [];

// Guarda apenas os produtos da categoria selecionada
let produtosCategoriaAtual = [];

// Controla se o botão "Ver Mais" está aberto
// false = mostra apenas 5 produtos
// true = mostra todos os produtos
let aberto = false;

// Página atual das categorias
let paginaCategoria = 0;

// Quantidade máxima de categorias visíveis
const LIMITE_CATEGORIAS = 4;

// Quantidade máxima de cards visíveis
const LIMITE_CARDS = 5;

// Categoria selecionada
let categoriaAtiva = null;


// ======================================================
// CARREGAR CATEGORIAS
// ======================================================

async function carregarCategorias() {

    // Faz uma requisição para a API
    const response = await fetch(API_CATEGORIAS);

    // Converte a resposta para JSON
    const dados = await response.json();

    // Salva as categorias invertendo a ordem
    todasCategorias = dados.response.categoria.reverse();
}


// ======================================================
// CARREGAR PRODUTOS
// ======================================================

async function carregarProdutos() {

    // Faz uma requisição para a API
    const response = await fetch(API_PRODUTOS);

    // Converte a resposta para JSON
    const dados = await response.json();

    // Guarda todos os produtos
    todosProdutos = dados.response.produto;
}


// ======================================================
// PROCURAR ID DA CATEGORIA PELO NOME
// ======================================================

function pegarCategoriaId(nome) {

    // Procura uma categoria que tenha o texto informado
    const categoria = todasCategorias.find(c =>

        // Transforma tudo em minúsculo
        // para evitar erro de maiúscula/minúscula
        c.categoria.toLowerCase().includes(nome.toLowerCase())
    );

    // Se encontrou a categoria
    if (categoria) {

        // Retorna o ID dela
        return categoria.id;
    }

    // Se não encontrou
    return null;
}


// ======================================================
// MOSTRAR CATEGORIAS NA TELA
// ======================================================

function renderizarCategorias() {

    // Remove todos os botões antigos
    menu.replaceChildren();

    // Calcula o início da página atual
    const inicio = paginaCategoria * LIMITE_CATEGORIAS;

    // Calcula o final da página atual
    const fim = inicio + LIMITE_CATEGORIAS;

    // Pega apenas as categorias dessa página
    const categoriasVisiveis = todasCategorias.slice(inicio, fim);

    // Percorre cada categoria
    categoriasVisiveis.forEach(categoria => {

        // Cria um botão
        const botao = document.createElement('button');

        // Coloca o nome da categoria
        botao.textContent = categoria.categoria.toUpperCase();

        // Verifica se essa categoria é a ativa
        if (Number(categoria.id) === Number(categoriaAtiva)) {

            // Adiciona classe CSS
            botao.classList.add('ativo');
        }

        // Evento de clique
        botao.addEventListener('click', () => {

            // Salva categoria clicada
            categoriaAtiva = Number(categoria.id);

            // Filtra produtos
            filtrarCategoria(Number(categoria.id));

            // Atualiza visualmente as categorias
            renderizarCategorias();
        });

        // Coloca o botão dentro do menu
        menu.appendChild(botao);
    });
}


// ======================================================
// FILTRAR PRODUTOS DA CATEGORIA
// ======================================================

function filtrarCategoria(idCategoria) {

    // Salva categoria atual
    categoriaAtiva = Number(idCategoria);

    // Sempre fecha o modo "ver mais"
    aberto = false;

    // Filtra apenas os produtos dessa categoria
    produtosCategoriaAtual = todosProdutos.filter(produto => {

        // Se o produto não tiver categoria
        if (!produto.tipo_categoria) {
            return false;
        }

        // Verifica se alguma categoria do produto
        // corresponde à categoria selecionada
        return produto.tipo_categoria.some(item => {

            return Number(item.id_categoria) === Number(idCategoria);

        });
    });

    // Mostra os produtos filtrados
    renderizarProdutos(produtosCategoriaAtual);

    // Volta o texto do botão
    botaoVerTudo.textContent = 'VER MAIS';
}

// ======================================================
// MOSTRAR PRODUTOS NA TELA
// ======================================================

function renderizarProdutos(produtos) {

    // Remove todos os cards antigos
    containerCard.replaceChildren();

    // Variável que vai guardar os produtos
    // que realmente serão exibidos
    let lista = [];

    // Se estiver aberto
    if (aberto) {

        // Mostra todos os produtos
        lista = produtos;

    } else {

        // Mostra apenas os primeiros 5
        lista = produtos.slice(0, LIMITE_CARDS);
    }

    // Percorre todos os produtos da lista
    lista.forEach(produto => {

        // Valor padrão do preço
        let preco = 0;

        // Verifica se existe tipo_categoria
        if (produto.tipo_categoria) {

            // Verifica se existe a primeira posição do array
            if (produto.tipo_categoria[0]) {

                // Verifica se existe preço
                if (produto.tipo_categoria[0].preco != null) {

                    // Guarda o preço
                    preco = produto.tipo_categoria[0].preco;
                }
            }
        }

        // ======================================================
        // CRIAR CARD
        // ======================================================

        const card = document.createElement('div');

        // Adiciona a classe CSS
        card.classList.add('card-produto');

        // ======================================================
        // CONTAINER DA FOTO
        // ======================================================

        const fotoContainer = document.createElement('div');

        fotoContainer.classList.add('foto-produto');

        // ======================================================
        // IMAGEM DO PRODUTO
        // ======================================================

        const imagem = document.createElement('img');

        if (produto.foto) {
            // Se começar com http (Cloudinary), usa a URL direta. Se não, busca localmente.
            imagem.src = produto.foto.startsWith('http') 
                ? produto.foto 
                : `img/${produto.foto}`;
        } else {
            // Imagem padrão
            imagem.src = 'img/default.png';
        }

        // Texto alternativo da imagem
        imagem.alt = produto.nome;

        // Trata erro caso a imagem local antiga falhe
        imagem.onerror = function() {
            this.src = 'img/default.png';
        };

        // Coloca imagem dentro do container
        fotoContainer.appendChild(imagem);

        // ======================================================
        // NOME DO PRODUTO
        // ======================================================

        const nome = document.createElement('p');

        nome.classList.add('nome-produto');

        nome.textContent = produto.nome;

        // ======================================================
        // DESCRIÇÃO
        // ======================================================

        const descricao = document.createElement('p');

        descricao.classList.add('descricao-produto');

        descricao.textContent = produto.descricao;

        // ======================================================
        // PREÇO
        // ======================================================

        const precoProduto = document.createElement('p');

        precoProduto.classList.add('preco-produto');

        precoProduto.textContent =
            Number(preco).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

        // ======================================================
        // BOTÃO VER DETALHES
        // ======================================================

        const btnDetalhes = document.createElement('button');

        btnDetalhes.classList.add('ver-detalhes');

        btnDetalhes.textContent = 'VER DETALHES';

        // Quando clicar no botão
        btnDetalhes.addEventListener('click', () => {

            // Vai para a página do produto
            window.location.href =
                `/tela-de-vizualizar-produto/index.html?id=${produto.id}`;
        });

        // ======================================================
        // MONTAGEM DO CARD
        // ======================================================

        card.appendChild(fotoContainer);

        card.appendChild(nome);

        card.appendChild(descricao);

        card.appendChild(precoProduto);

        card.appendChild(btnDetalhes);

        // Coloca card na tela
        containerCard.appendChild(card);
    });

    // ======================================================
    // MOSTRAR OU ESCONDER BOTÃO VER MAIS
    // ======================================================

    if (produtos.length <= LIMITE_CARDS) {

        // Esconde botão
        botaoVerTudo.style.display = 'none';

    } else {

        // Mostra botão
        botaoVerTudo.style.display = 'flex';
    }
}


// ======================================================
// BOTÃO VER MAIS / VER MENOS
// ======================================================

botaoVerTudo.addEventListener('click', () => {

    // Inverte o valor da variável

    if (aberto) {

        aberto = false;

    } else {

        aberto = true;
    }

    // Atualiza os produtos
    renderizarProdutos(produtosCategoriaAtual);

    // Atualiza o texto do botão

    if (aberto) {

        botaoVerTudo.textContent = 'VER MENOS';

    } else {

        botaoVerTudo.textContent = 'VER MAIS';
    }
});


// ======================================================
// SETA DIREITA
// ======================================================

setaDireita.addEventListener('click', () => {

    // Calcula quantas páginas existem
    const totalPaginas =
        Math.ceil(
            todasCategorias.length / LIMITE_CATEGORIAS
        );

    // Verifica se ainda existe próxima página
    if (paginaCategoria < totalPaginas - 1) {

        // Avança uma página
        paginaCategoria++;

        // Atualiza categorias
        renderizarCategorias();
    }
});


// ======================================================
// SETA ESQUERDA
// ======================================================

setaEsquerda.addEventListener('click', () => {

    // Se não estiver na primeira página
    if (paginaCategoria > 0) {

        // Volta uma página
        paginaCategoria--;

        // Atualiza categorias
        renderizarCategorias();
    }
});

// ======================================================
// ÍCONE CAFÉ
// ======================================================

// Procura o elemento no HTML
const circuloCafe = document.querySelector('.circulo-cafe');

// Verifica se ele existe
if (circuloCafe) {

    circuloCafe.addEventListener('click', () => {

        // Procura o ID da categoria café
        const id = pegarCategoriaId('café');

        // Se não encontrar, para a execução
        if (!id) {
            return;
        }

        // Define categoria ativa
        categoriaAtiva = Number(id);

        // Filtra os produtos
        filtrarCategoria(Number(id));

        // Atualiza os botões das categorias
        renderizarCategorias();
    });
}


// ======================================================
// ÍCONE CHÁ
// ======================================================

const circuloCha = document.querySelector('.circulo-cha');

if (circuloCha) {

    circuloCha.addEventListener('click', () => {

        const id = pegarCategoriaId('chá');

        if (!id) {
            return;
        }

        categoriaAtiva = Number(id);

        filtrarCategoria(Number(id));

        renderizarCategorias();
    });
}


// ======================================================
// ÍCONE DOCE
// ======================================================

const circuloDoce = document.querySelector('.circulo-doce');

if (circuloDoce) {

    circuloDoce.addEventListener('click', () => {

        const id = pegarCategoriaId('doce');

        if (!id) {
            return;
        }

        categoriaAtiva = Number(id);

        filtrarCategoria(Number(id));

        renderizarCategorias();
    });
}


// ======================================================
// ÍCONE DRINKS
// ======================================================

const circuloDrinks = document.querySelector('.circulo-drinks');

if (circuloDrinks) {

    circuloDrinks.addEventListener('click', () => {

        const id = pegarCategoriaId('drink');

        if (!id) {
            return;
        }

        categoriaAtiva = Number(id);

        filtrarCategoria(Number(id));

        renderizarCategorias();
    });
}


// ======================================================
// INICIAR APLICAÇÃO
// ======================================================

async function iniciar() {

    // Espera as duas funções terminarem
    await Promise.all([
        carregarCategorias(),
        carregarProdutos()
    ]);

    // Verifica se existem categorias carregadas
    if (todasCategorias.length > 0) {

        // Seleciona a primeira categoria
        categoriaAtiva = todasCategorias[0].id;

        // Filtra os produtos da primeira categoria
        filtrarCategoria(categoriaAtiva);

        // Mostra as categorias na tela
        renderizarCategorias();
    }
}


// ======================================================
// INICIA O SISTEMA
// ======================================================

iniciar();

// Quando esta linha executa:
// 1 - Carrega categorias
// 2 - Carrega produtos
// 3 - Seleciona a primeira categoria
// 4 - Mostra os produtos
// 5 - Mostra os botões das categorias