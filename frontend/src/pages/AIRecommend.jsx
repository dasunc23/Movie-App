import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button, Textarea, Card, MovieCard, Loader } from '../components/common';
import { recommendationService } from '../services';

const AIRecommend = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please describe your mood or what you want to watch');
      return;
    }

    setError('');
    setLoading(true);
    setRecommendations(null);

    try {
      const response = await recommendationService.getRecommendations(prompt);
      setRecommendations(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setPrompt('');
    setRecommendations(null);
    setError('');
  };

  const examplePrompts = [
    "I want something dark and psychological with plot twists",
    "Fun action movies with great fight scenes",
    "Romantic comedies that are actually funny",
    "Mind-bending sci-fi like Inception",
    "Feel-good movies for a cozy night",
    "Thrillers that keep me on edge"
  ];

  return (
    <div className="min-h-screen bg-black">
      <Container className="py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Movie Recommendations
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Describe your mood, vibe, or what you're looking for, and let AI find the perfect movies for you
          </p>
        </div>

        {/* Main Content */}
        {!recommendations ? (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8">
              <form onSubmit={handleSubmit}>
                <Textarea
                  label="What are you in the mood for?"
                  placeholder="e.g., I want something thrilling with plot twists, maybe sci-fi, that keeps me on edge..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  maxLength={500}
                  required
                  className="mb-6"
                />

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  className="mb-6"
                >
                  {loading ? (
                    <>
                      <Loader size="sm" />
                      <span>AI is thinking...</span>
                    </>
                  ) : (
                    <>🤖 Get Recommendations</>
                  )}
                </Button>
              </form>

              {/* Example Prompts */}
              <div className="mt-8">
                <p className="text-sm text-gray-400 mb-3">Try these examples:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-left text-sm text-primary-400 hover:text-primary-300 bg-primary-600/10 hover:bg-primary-600/20 px-3 py-2 rounded-lg transition-colors"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* AI Response */}
            <Card className="p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Your Recommendations</h2>
                  <p className="text-gray-400">Based on: "{recommendations.prompt}"</p>
                </div>
                <Button variant="outline" onClick={handleTryAgain}>
                  Try Another
                </Button>
              </div>

              {/* AI Explanation */}
              <div className="bg-primary-600/10 border border-primary-600/30 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🤖</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">AI Says:</p>
                    <div className="text-gray-200 whitespace-pre-line">
                      {recommendations.aiResponse}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Movies */}
              {recommendations.movies && recommendations.movies.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-6">
                    Recommended Movies ({recommendations.movies.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recommendations.movies.map((movie) => (
                      <MovieCard
                        key={movie._id}
                        movie={movie}
                        onClick={() => navigate(`/movie/${movie.tmdbId}`)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button variant="primary" onClick={handleTryAgain}>
                🔄 Get New Recommendations
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                🏠 Back to Home
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default AIRecommend;