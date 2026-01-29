import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button, MovieCard, Loader } from '../components/common';
import { movieService } from '../services';

const Browse = () => {
  const { type } = useParams(); // trending, popular, or top-rated
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchMovies();
  }, [type, page]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let response;
      
      switch(type) {
        case 'trending':
          response = await movieService.getTrendingMovies();
          setMovies(response.data.movies);
          setTotalPages(1); // TMDB doesn't paginate trending
          break;
        case 'popular':
          response = await movieService.getPopularMovies(page);
          setMovies(response.data.movies);
          setTotalPages(response.data.totalPages);
          break;
        case 'top-rated':
          response = await movieService.getTopRatedMovies(page);
          setMovies(response.data.movies);
          setTotalPages(response.data.totalPages);
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTitle = () => {
    switch(type) {
      case 'trending': return '🔥 Trending Movies';
      case 'popular': return '⭐ Popular Movies';
      case 'top-rated': return '🏆 Top Rated Movies';
      default: return 'Browse Movies';
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            ← Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-white">{getTitle()}</h1>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => navigate(`/movie/${movie.id}`)}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              ← Previous
            </Button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(totalPages, 10))].map((_, index) => {
                const pageNum = index + 1;
                if (pageNum >= page - 2 && pageNum <= page + 2) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'primary' : 'ghost'}
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next →
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Browse;