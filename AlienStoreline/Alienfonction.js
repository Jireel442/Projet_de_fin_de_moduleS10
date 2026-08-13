const container = document.getElementById('products-container');
const loading = document.getElementById('loading');

    // 1. Fonction asynchrone pour récupérer les données de l'API
async function getProducts() {
    try {
    const response = await fetch('https://fakestoreapi.com/products');
        
    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const products = await response.json();
        
    // Cacher le message de chargement
    loading.style.display = 'none';

    // 2. Afficher les produits
    displayProducts(products);

    } catch (error) {
    loading.textContent = 'Impossible de charger les produits.';
    console.error('Erreur lors du fetch :', error);
    }
}
function displayProducts(products) {
    products.forEach(product => {
    // Création de l'élément div pour la carte
    const card = document.createElement('div');
    card.className = 'card';

    // Structure interne de la carte
    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h3>${product.title}</h3>
        <p class="price">${product.price.toFixed(2)} €</p>
    `;

    // Ajout dans le conteneur principal
    container.appendChild(card);
    });
}

// Appeler la fonction au chargement de la page
getProducts();