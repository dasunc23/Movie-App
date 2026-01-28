import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button, Card, MovieCard, Loader, Modal } from '../components/common';
import { movieService, watchHistoryService } from '../services';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [watchStatus, setWatchStatus] = useState(null);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      const [movieResponse, similarResponse] = await Promise.all([
        movieService.getMovieById(id),
        movieService.getSimilarMovies(id, 1)
      ]);

      setMovie(movieResponse.data);
      setSimilarMovies(similarResponse.data.movies.slice(0, 6));
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (status = 'watchlist') => {
    setAddingToWatchlist(true);
    try {
      await watchHistoryService.addToWatchHistory(movie.tmdbId, status);
      setWatchStatus(status);
      alert(`Added to ${status}!`);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add to watchlist');
    } finally {
      setAddingToWatchlist(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Movie not found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdropPath
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;

  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Backdrop */}
      <div className="relative">
        {/* Backdrop Image */}
        {backdropUrl && (
          <div className="absolute inset-0 h-[70vh]">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>
        )}

        {/* Content */}
        <Container className="relative pt-32 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="md:col-span-1">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full rounded-xl shadow-2xl"
              />
            </div>

            {/* Movie Info */}
            <div className="md:col-span-2 text-white">
              <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                {movie.releaseDate && (
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                )}
                {movie.runtime && <span>• {movie.runtime} min</span>}
                {movie.voteAverage && (
                  <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{movie.voteAverage.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-600/30 border border-primary-500/50 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-3">Overview</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {movie.overview || 'No overview available.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleAddToWatchlist('watchlist')}
                  disabled={addingToWatchlist}
                >
                  ➕ Add to Watchlist
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleAddToWatchlist('watched')}
                  disabled={addingToWatchlist}
                >
                  ✓ Mark as Watched
                </Button>

                {movie.trailerKey && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowTrailer(true)}
                  >
                    ▶ Watch Trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Additional Info */}
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-2">Original Language</h3>
            <p className="text-gray-400">{movie.originalLanguage?.toUpperCase() || 'N/A'}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-2">Popularity</h3>
            <p className="text-gray-400">{movie.popularity?.toFixed(0) || 'N/A'}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-2">Vote Count</h3>
            <p className="text-gray-400">{movie.voteCount?.toLocaleString() || 'N/A'}</p>
          </Card>
        </div>

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Similar Movies</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {similarMovies.map((similarMovie) => (
                <MovieCard
                  key={similarMovie.id}
                  movie={similarMovie}
                  onClick={() => {
                    navigate(`/movie/${similarMovie.id}`);
                    window.scrollTo(0, 0);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Trailer Modal */}
      {showTrailer && movie.trailerKey && (
        <Modal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          title={`${movie.title} - Trailer`}
          size="xl"
        >
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MovieDetails;