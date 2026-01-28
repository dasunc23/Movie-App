import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button, Input, MovieCard, Loader } from '../components/common';
import { movieService } from '../services';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(q, 1);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await movieService.searchMovies(searchQuery, pageNum);
      setMovies(response.data.movies);
      setTotalPages(response.data.totalPages);
      setTotalResults(response.data.totalResults);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to search movies. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      handleSearch(query, 1);
    }
  };

  const handlePageChange = (newPage) => {
    handleSearch(query, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black">
      <Container className="py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">Search Movies</h1>
          
          <form onSubmit={handleSubmit} className="relative max-w-3xl">
            <Input
              type="text"
              placeholder="Search for movies, TV shows, actors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-lg pr-32"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            
            <Button 
              type="submit"
              variant="primary"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 max-w-3xl">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        )}

        {/* Search Results */}
        {!loading && movies.length > 0 && (
          <>
            {/* Results Info */}
            <div className="mb-6">
              <p className="text-gray-400">
                Found <span className="text-white font-semibold">{totalResults}</span> results for 
                <span className="text-primary-400 font-semibold"> "{searchParams.get('q')}"</span>
              </p>
            </div>

            {/* Movie Grid */}
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
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2"
                >
                  ← Previous
                </Button>

                <div className="flex items-center gap-2">
                  {/* Show first page */}
                  {page > 3 && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2"
                      >
                        1
                      </Button>
                      {page > 4 && <span className="text-gray-500">...</span>}
                    </>
                  )}

                  {/* Show pages around current page */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    if (pageNum >= page - 2 && pageNum <= page + 2) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'primary' : 'ghost'}
                          onClick={() => handlePageChange(pageNum)}
                          className="px-3 py-2 min-w-[40px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}

                  {/* Show last page */}
                  {page < totalPages - 2 && (
                    <>
                      {page < totalPages - 3 && <span className="text-gray-500">...</span>}
                      <Button
                        variant="ghost"
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-2"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && movies.length === 0 && searchParams.get('q') && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Results Found</h2>
            <p className="text-gray-400 mb-6">
              We couldn't find any movies matching "{searchParams.get('q')}"
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        )}

        {/* Initial State (no search yet) */}
        {!loading && movies.length === 0 && !searchParams.get('q') && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold text-white mb-2">Search for Movies</h2>
            <p className="text-gray-400 mb-8">
              Enter a movie name, actor, or keyword to get started
            </p>

            {/* Popular Searches */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-500 mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Batman', 'Marvel', 'Inception', 'Star Wars', 'Avengers', 'Interstellar'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      setSearchParams({ q: term });
                    }}
                    className="px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Search;