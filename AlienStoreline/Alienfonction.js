const container = document.getElementById('products-container');
const loading = document.getElementById('loading');
const rechercheInput = document.getElementById('screen');
const choixcate = document.getElementById('select-categorie');
const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');

if (!container || !loading) {
  console.error('Éléments du conteneur manquants dans le DOM.');
}

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('alienStoreCart')) || [];

function saveCart() {
  localStorage.setItem('alienStoreCart', JSON.stringify(cart));
}

function updateCartBadge() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

function renderCart() {
  if (!cartItems || !cartTotal) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide.</p>';
    cartTotal.textContent = '0.00 Xaf';
    updateCartBadge();
    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${item.title}</strong>
          <span>${item.price.toFixed(2)} Xaf</span>
        </div>
        <div class="cart-item-actions">
          <button type="button" data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-id="${item.id}">+</button>
          <button type="button" class="remove-item" data-action="remove" data-id="${item.id}">Supprimer</button>
        </div>
      </div>
    `;
  }).join('');

  cartTotal.textContent = `${total.toFixed(2)} Xaf`;
  updateCartBadge();
}

function addToCart(product) {
  const existingProduct = cart.find(item => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
  if (cartPanel) {
    cartPanel.classList.add('open');
  }
}

function updateQuantity(productId, action) {
  const existingProduct = cart.find(item => item.id === productId);

  if (!existingProduct) return;

  if (action === 'increase') {
    existingProduct.quantity += 1;
  }

  if (action === 'decrease') {
    existingProduct.quantity -= 1;
  }

  if (existingProduct.quantity <= 0) {
    cart = cart.filter(item => item.id !== productId);
  }

  saveCart();
  renderCart();
}

async function getProducts() {
  try {
    const response = await fetch('https://fakestoreapi.com/products');

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    allProducts = await response.json();

    loading.style.display = 'none';

    filterAndDisplayProducts();

  } catch (error) {
    loading.textContent = 'Impossible de charger les produits.';
    console.error('Erreur lors du fetch :', error);
  }
}

function filterAndDisplayProducts() {
  const recherche = rechercheInput ? rechercheInput.value.toLowerCase().trim() : '';
  const choixcategory = choixcate ? choixcate.value : 'all';

  const filtreProd = allProducts.filter(product => {
    const rechercheProd = product.title.toLowerCase().includes(recherche);

    const matchesCategory = choixcategory === 'all' || product.category === choixcategory;

    return rechercheProd && matchesCategory;
  });

  displayProducts(filtreProd);
}

function displayProducts(products) {
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = '<p class="no-results">Aucun produit ne correspond à votre recherche.</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p class="price">${product.price.toFixed(2)} Xaf</p>
      <button type="button" class="add-to-cart" data-id="${product.id}">Ajouter</button>
    `;

    const btn = card.querySelector('.add-to-cart');
    btn.addEventListener('click', () => addToCart(product));

    container.appendChild(card);
  });
}

if (rechercheInput) {
  rechercheInput.addEventListener('input', filterAndDisplayProducts);
}

if (choixcate) {
  choixcate.addEventListener('change', filterAndDisplayProducts);
}

if (cartToggle && cartPanel) {
  cartToggle.addEventListener('click', () => {
    cartPanel.classList.toggle('open');
  });
}

if (closeCart && cartPanel) {
  closeCart.addEventListener('click', () => {
    cartPanel.classList.remove('open');
  });
}

if (cartItems) {
  cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('button');

    if (!button) return;

    const { action, id } = button.dataset;
    const productId = Number(id);

    if (action === 'increase' || action === 'decrease') {
      updateQuantity(productId, action);
    }

    if (action === 'remove') {
      cart = cart.filter(item => item.id !== productId);
      saveCart();
      renderCart();
    }
  });
}

renderCart();
getProducts();