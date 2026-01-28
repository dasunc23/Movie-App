import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button, Card, MovieCard, Loader } from '../components/common';
import { watchHistoryService } from '../services';

const Watchlist = () => {
  const [activeTab, setActiveTab] = useState('watchlist');
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWatchHistory();
    fetchStats();
  }, [activeTab]);

  const fetchWatchHistory = async () => {
    setLoading(true);
    try {
      const response = await watchHistoryService.getWatchHistory(activeTab);
      setMovies(response.data.watchHistory);
    } catch (error) {
      console.error('Error fetching watch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await watchHistoryService.getWatchStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to remove this movie?')) {
      try {
        await watchHistoryService.removeFromWatchHistory(id);
        fetchWatchHistory();
        fetchStats();
      } catch (error) {
        console.error('Error removing movie:', error);
        alert('Failed to remove movie');
      }
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await watchHistoryService.toggleFavorite(id);
      fetchWatchHistory();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const tabs = [
    { id: 'watchlist', label: 'Watchlist', icon: '📋' },
    { id: 'watching', label: 'Watching', icon: '👀' },
    { id: 'watched', label: 'Watched', icon: '✓' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Movies</h1>
          <p className="text-gray-400">Track and manage your movie collection</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">
                {stats.counts.watchlist}
              </div>
              <div className="text-sm text-gray-400">Want to Watch</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {stats.counts.watching}
              </div>
              <div className="text-sm text-gray-400">Currently Watching</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats.counts.watched}
              </div>
              <div className="text-sm text-gray-400">Watched</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {stats.counts.favorites}
              </div>
              <div className="text-sm text-gray-400">Favorites</div>
            </Card>
          </div>
        )}

        {/* Watch Stats */}
        {stats && stats.watchedStats.totalMovies > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Your Watch Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Movies</p>
                <p className="text-2xl font-bold text-white">{stats.watchedStats.totalMovies}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Hours</p>
                <p className="text-2xl font-bold text-white">{stats.watchedStats.totalHours}h</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Average Rating</p>
                <p className="text-2xl font-bold text-white">
                  {stats.watchedStats.averageRating > 0 ? stats.watchedStats.averageRating : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Favorite Genre</p>
                <p className="text-2xl font-bold text-white">
                  {stats.watchedStats.favoriteGenre || 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap"
            >
              {tab.icon} {tab.label}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        )}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((item) => (
              <div key={item._id} className="relative group">
                <MovieCard
                  movie={item.movie}
                  onClick={() => navigate(`/movie/${item.movie.tmdbId}`)}
                />

                {/* Action Overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item._id);
                    }}
                    className={`p-2 rounded-full backdrop-blur-sm ${
                      item.isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-black/50 text-gray-300 hover:text-red-500'
                    }`}
                    title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg className="w-5 h-5" fill={item.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item._id);
                    }}
                    className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-gray-300 hover:text-red-500"
                    title="Remove from list"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Rating Badge (for watched movies) */}
                {item.userRating && (
                  <div className="absolute bottom-20 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-white">{item.userRating}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && movies.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {activeTab === 'watchlist' && '📋'}
              {activeTab === 'watching' && '👀'}
              {activeTab === 'watched' && '✓'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No movies in {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-gray-400 mb-6">
              Start adding movies to build your collection
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" onClick={() => navigate('/')}>
                Browse Movies
              </Button>
              <Button variant="outline" onClick={() => navigate('/ai-recommend')}>
                Get AI Recommendations
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Watchlist;