const container = document.getElementById('products-container');
const loading = document.getElementById('loading');
const rechercheInput = document.getElementById('screen');
const choixcate = document.getElementById('select-categorie');

let allProducts = [];
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
      <p class="price">${product.price.toFixed(2)} €</p>
    `;

    container.appendChild(card);
  });
}

if (rechercheInput) {
  searchInput.addEventListener('input', filterAndDisplayProducts);
}

if (choixcate) {
  choixcate.addEventListener('change', filterAndDisplayProducts);
}

getProducts();