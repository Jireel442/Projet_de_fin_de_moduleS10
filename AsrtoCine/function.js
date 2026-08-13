 const API_KEY = '5aeb54e4c373db51d25cbe49acb8d16f'; 
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
    async function fetchMovies() {
      try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=1`);

        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        displayMovies(data.results);

      } catch (error) {
        console.error('Erreur lors du chargement :', error);
        document.getElementById('movies-container').innerHTML = 
          `<p style="color: #ff6b6b; text-align: center; grid-column: 1/-1;">
            Impossible de charger les films. Vérifiez votre clé API dans le code.
          </p>`;
      }
    }

    function displayMovies(movies) {
      const container = document.getElementById('movies-container');
      container.innerHTML = ''; 

      movies.forEach(movie => {
        // Image de couverture
        const posterPath = movie.poster_path 
          ? `${IMAGE_URL}${movie.poster_path}` 
          : 'https://via.placeholder.com/500x750?text=Pas+d+image';

        // Année de sortie
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

        // Création de l'élément HTML
        const card = document.createElement('div');
        card.className = 'movie-card';

        card.innerHTML = `
          <img class="movie-poster" src="${posterPath}" alt="${movie.title}">
          <div class="movie-info">
            <div class="movie-title" title="${movie.title}">${movie.title}</div>
            <div class="movie-meta">
              <span>${releaseYear}</span>
              <span class="rating">★ ${movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    }

    document.addEventListener('DOMContentLoaded', fetchMovies);