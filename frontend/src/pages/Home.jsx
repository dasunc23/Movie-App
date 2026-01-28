import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button, Input, MovieCard, Loader } from '../components/common';
import { movieService } from '../services';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const [trending, popular, topRated] = await Promise.all([
        movieService.getTrendingMovies(),
        movieService.getPopularMovies(),
        movieService.getTopRatedMovies()
      ]);

      setTrendingMovies(trending.data.movies.slice(0, 6));
      setPopularMovies(popular.data.movies.slice(0, 6));
      setTopRatedMovies(topRated.data.movies.slice(0, 6));
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-black">

      {/* HERO SECTION */}
      <section className="relative h-[65vh] min-h-[420px] flex items-center justify-center overflow-hidden">

        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay ( BLUR) */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-snug mb-5">
            <span className="block text-white">
              Discover Your
            </span>
            <span className="block text-primary-500">
              Next Favorite Movie
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            AI-powered recommendations based on your mood and preferences
          </p>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/ai-recommend')}  
              className="px-10 py-4 text-base shadow-lg hover:shadow-primary-500/40 transition"
            >
              🤖 Get AI Recommendations
            </Button>
        </div>
      </section>

      {/* SEARCH SECTION */}
      <section className="bg-gradient-to-b from-black via-gray-900 to-black py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-8 text-white">
              Search Movies
            </h2>

            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search for movies, TV shows, actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg"
              />

              <Button
                type="submit"
                variant="primary"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Search
              </Button>
            </form>
          </div>
        </Container>
      </section>

      {/* MOVIE SECTIONS */}
      <div className="bg-black">
        <Container>

          {/* Trending */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                🔥 Trending Now
              </h2>
              <Button
                variant="ghost"
                className="text-white hover:text-primary-400"
                onClick={() => navigate('/browse/trending')}
              >
                View All →
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendingMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                />
              ))}
            </div>
          </section>

          {/* Popular */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                ⭐ Popular Movies
              </h2>
              <Button
                variant="ghost"
                className="text-white hover:text-primary-400"
                onClick={() => navigate('/browse/popular')}
              >
                View All →
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                />
              ))}
            </div>
          </section>

          {/* Top Rated */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                🏆 Top Rated
              </h2>
              <Button
                variant="ghost"
                className="text-white hover:text-primary-400"
                onClick={() => navigate('/browse/top-rated')}
              >
                View All →
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topRatedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                />
              ))}
            </div>
          </section>

        </Container>
      </div>
    </div>
  );
};

export default Home;
