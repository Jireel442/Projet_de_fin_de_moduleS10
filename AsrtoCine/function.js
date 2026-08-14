const API_KEY = '5aeb54e4c373db51d25cbe49acb8d16f';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const searchInput = document.getElementById('movie-search');
const productsLink = document.getElementById('products-link');
const favoritesNav = document.getElementById('favorites-nav');
const favoritesKey = 'favoriteMovies';
let favoriteMovies = JSON.parse(localStorage.getItem(favoritesKey)) || [];
let isFavoritesView = false;

function getRatingClass(voteAverage) {
  if (voteAverage >= 7) return 'rating-good';
  if (voteAverage >= 5) return 'rating-medium';
  return 'rating-bad';
}

function saveFavorites() {
  localStorage.setItem(favoritesKey, JSON.stringify(favoriteMovies));
}

function isFavorite(movieId) {
  return favoriteMovies.some(movie => movie.id === movieId);
}

function toggleFavorite(movie) {
  const movieExists = favoriteMovies.some(item => item.id === movie.id);

  if (movieExists) {
    favoriteMovies = favoriteMovies.filter(item => item.id !== movie.id);
  } else {
    favoriteMovies.push({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average
    });
  }

  saveFavorites();
  renderFavorites();
  refreshFavoriteButtons();
}

function refreshFavoriteButtons() {
  document.querySelectorAll('.favorite-btn').forEach(button => {
    const movieId = Number(button.dataset.id);
    const isActive = isFavorite(movieId);
    button.classList.toggle('active', isActive);
    button.textContent = isActive ? '♥' : '♡';
  });
}

function renderFavorites() {
  const favoritesContainer = document.getElementById('favorites-container');

  if (!favoritesContainer) return;

  if (!favoriteMovies.length) {
    favoritesContainer.innerHTML = '<p class="empty-favorites">Aucun film favori pour le moment.</p>';
    return;
  }

  favoritesContainer.innerHTML = favoriteMovies.map(movie => {
    const posterPath = movie.poster_path
      ? `${IMAGE_URL}${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=Pas+d+image';

    return `
      <div class="favorite-card" data-id="${movie.id}">
        <img src="${posterPath}" alt="${movie.title}">
        <div class="favorite-info">
          <h3>${movie.title}</h3>
          <span class="rating ${getRatingClass(Number(movie.vote_average ?? 0))}">★ ${(Number(movie.vote_average ?? 0)).toFixed(1)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function showFavoritesOnly() {
  isFavoritesView = true;

  if (!favoriteMovies.length) {
    const container = document.getElementById('movies-container');
    if (container) {
      container.innerHTML = '<p style="color: #ff6b6b; text-align: center; grid-column: 1/-1;">Aucun favori enregistré.</p>';
    }
    return;
  }

  displayMovies(favoriteMovies);
}

function showPopularMovies() {
  isFavoritesView = false;
  fetchMovies(searchInput ? searchInput.value.trim() : '');
}

async function fetchMovies(query = '') {
  try {
    const endpoint = query
      ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1`
      : `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=1`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();
    displayMovies(data.results || []);

  } catch (error) {
    console.error('Erreur lors du chargement :', error);
    const container = document.getElementById('movies-container');

    if (container) {
      container.innerHTML = `
        <p style="color: #ff6b6b; text-align: center; grid-column: 1/-1;">
          Impossible de charger les films. Vérifiez votre clé API dans le code.
        </p>`;
    }
  }
}

function displayMovies(movies) {
  const container = document.getElementById('movies-container');

  if (!container) return;

  container.innerHTML = '';

  if (!movies.length) {
    container.innerHTML = '<p style="color: #ff6b6b; text-align: center; grid-column: 1/-1;">Aucun film trouvé.</p>';
    return;
  }

  movies.forEach(movie => {
    const posterPath = movie.poster_path
      ? `${IMAGE_URL}${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=Pas+d+image';

    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const voteAverage = Number(movie.vote_average ?? 0);

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = movie.id;

    card.innerHTML = `
      <button type="button" class="favorite-btn ${isFavorite(movie.id) ? 'active' : ''}" data-id="${movie.id}" aria-label="Ajouter aux favoris">
        ${isFavorite(movie.id) ? '♥' : '♡'}
      </button>
      <img class="movie-poster" src="${posterPath}" alt="${movie.title}">
      <div class="movie-info">
        <div class="movie-title" title="${movie.title}">${movie.title}</div>
        <div class="movie-meta">
          <span>${releaseYear}</span>
          <span class="rating ${getRatingClass(voteAverage)}">★ ${voteAverage.toFixed(1)}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

async function openMovieModal(movieId) {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR`);

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const movie = await response.json();
    const modal = document.getElementById('movie-modal');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalBody) return;

    const posterPath = movie.poster_path
      ? `${IMAGE_URL}${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=Pas+d+image';

    const genres = movie.genres && movie.genres.length
      ? movie.genres.map(genre => genre.name).join(', ')
      : 'Aucun genre disponible';

    const isActive = isFavorite(movie.id);

    modalBody.innerHTML = `
      <div class="modal-poster-wrap">
        <img src="${posterPath}" alt="${movie.title}" class="modal-poster">
      </div>
      <div class="modal-content-text">
        <div class="modal-header-row">
          <h2 id="modal-title">${movie.title}</h2>
          <button type="button" class="favorite-btn modal-favorite ${isActive ? 'active' : ''}" data-id="${movie.id}" aria-label="Ajouter aux favoris">
            ${isActive ? '♥' : '♡'}
          </button>
        </div>
        <div class="movie-meta modal-meta">
          <span>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
          <span class="rating ${getRatingClass(Number(movie.vote_average ?? 0))}">★ ${(Number(movie.vote_average ?? 0)).toFixed(1)}</span>
        </div>
        <p><strong>Genres :</strong> ${genres}</p>
        <p><strong>Synopsis :</strong> ${movie.overview || 'Aucun synopsis disponible pour ce film.'}</p>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  } catch (error) {
    console.error('Erreur lors de l’ouverture de la modale :', error);
  }
}

function closeMovieModal() {
  const modal = document.getElementById('movie-modal');

  if (!modal) return;

  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.trim();

    if (isFavoritesView) {
      const filteredFavorites = favoriteMovies.filter(movie =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      );

      if (!filteredFavorites.length) {
        const container = document.getElementById('movies-container');
        if (container) {
          container.innerHTML = '<p style="color: #ff6b6b; text-align: center; grid-column: 1/-1;">Aucun favori trouvé.</p>';
        }
        return;
      }

      displayMovies(filteredFavorites);
      return;
    }

    fetchMovies(query);
  });
}

if (productsLink) {
  productsLink.addEventListener('click', (event) => {
    event.preventDefault();
    showPopularMovies();
    document.getElementById('movies-container').scrollIntoView({ behavior: 'smooth' });
  });
}

if (favoritesNav) {
  favoritesNav.addEventListener('click', () => {
    showFavoritesOnly();
    document.getElementById('movies-container').scrollIntoView({ behavior: 'smooth' });
  });
}

document.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('.favorite-btn');

  if (favoriteButton) {
    const movieId = Number(favoriteButton.dataset.id);
    const movieElement = document.querySelector(`.movie-card[data-id="${movieId}"]`);
    const movie = movieElement
      ? {
          id: movieId,
          title: movieElement.querySelector('.movie-title')?.textContent || 'Film inconnu',
          poster_path: movieElement.querySelector('.movie-poster')?.getAttribute('src')?.includes('image.tmdb.org')
            ? movieElement.querySelector('.movie-poster').getAttribute('src').replace(IMAGE_URL, '')
            : '',
          vote_average: Number(movieElement.querySelector('.rating')?.textContent?.replace('★ ', '') || 0)
        }
      : { id: movieId, title: 'Film inconnu', poster_path: '', vote_average: 0 };

    toggleFavorite(movie);
    return;
  }

  const card = event.target.closest('.movie-card');

  if (card) {
    openMovieModal(Number(card.dataset.id));
    return;
  }

  if (event.target.closest('[data-close="true"]') || event.target.closest('.modal-close')) {
    closeMovieModal();
  }

  const favoriteCard = event.target.closest('.favorite-card');
  if (favoriteCard) {
    openMovieModal(Number(favoriteCard.dataset.id));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  fetchMovies();
  renderFavorites();
});