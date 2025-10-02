📂 Estrutura de Pastas

assets/
 ├── data/
 │    └── produtos.json     # Base de dados dos produtos (usada pelo produto.html)
 │
 ├── icons/
 │    └── logo.svg          # Logo em SVG
 │
 └── img/
      ├── banners/          # Imagens do carrossel principal (hero slider)
      ├── produtos/         # Fotos de cada produto (ligadas pelo SKU)
      ├── promohero.png     # Banner da promoção diária
      └── prontopcomer.png  # Imagem da seção "Prontos para comer"

css/
 ├── home.css               # Estilos específicos da página inicial
 ├── login.css              # Estilos da tela de login
 ├── main.css               # Estilos globais (compartilhados)
 └── produto.css            # Estilos da página de produto (PDP)

js/
 ├── cart.js                # Lógica do carrinho (add/remove/update, modal)
 ├── home.js                # Scripts para index.html (hero slider, timers)
 ├── login.js               # Scripts da tela de login (Google/Facebook buttons)
 ├── main.js                # Funções globais (readCart, writeCart, updateCartBadge)
 └── produto.js             # Carregamento dinâmico da PDP via produtos.json

base.html                   # Estrutura base (pode servir de template)
index.html                  # Página inicial (home)
login.html                  # Tela de login
produto.html                # Página de produto (PDP)
README.md                   # Este arquivo

⚙️ Fluxo do Projeto

Home (index.html)

Hero slider com banners.

Categorias em grade.

Ofertas e promoções do dia (com timer e progress bar integrados, persistindo).

Integração com carrinho (cart.js fica a construção do modal, podemos aproveitar o localStorage para montar sessão de checkout).

Produto (produto.html)

Lê informações do produto via produtos.json (baseado no sku da URL).

Mantém valores de fallback no HTML caso o JSON não carregue.

Inclui galeria, preço, descrição, avaliações (ainda 1 por todos produtos).

Botão Comprar integrado ao carrinho.

Carrinho (cart.js)

Usa localStorage para persistir itens.

Modal 85% de tela no desktop, full-screen no mobile.

Incremento/diminuição de quantidade, exclusão e subtotal.

Login (login.html)

🗂️ JSON de Produtos (produtos.json)

Cada produto segue este formato:

{
  "sku": "filezinho",
  "name": "Filezinho Sassami 1kg",
  "price": 21.90,
  "oldPrice": 20.90,
  "stock": 50,
  "image": "assets/img/produtos/filezinho.jpg",
  "category": "Aves",
  "description": "Corte leve e saboroso, ideal para o dia a dia."
}

Para cadastrar recomendo usarem o sku como mesmo nome da imagem, para apenas duplicar os cards da home e trocar mais fácil

Se usar produto.html, passar ?sku=nome-do-produto na URL, ex.:

produto.html?sku=filezinho

ou utilizar de data-sku passando a sku e data-card-link para o script inserir o link


