import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button, Card, Loader, MovieCard } from '../components/common';
import { watchPartyService } from '../services';

const WatchPartyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingPrefs, setSubmittingPrefs] = useState(false);
  const [generatingRecs, setGeneratingRecs] = useState(false);
  
  // Preferences form
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation'];
  const moods = ['Exciting', 'Funny', 'Emotional', 'Scary', 'Mind-bending', 'Feel-good', 'Intense', 'Relaxing'];

  useEffect(() => {
    fetchPartyDetails();
  }, [id]);

  const fetchPartyDetails = async () => {
    setLoading(true);
    try {
      const response = await watchPartyService.getPartyById(id);
      setParty(response.data);
    } catch (error) {
      console.error('Error fetching party:', error);
      alert('Failed to load party details');
      navigate('/watch-parties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPreferences = async () => {
    if (selectedGenres.length === 0 && selectedMoods.length === 0) {
      alert('Please select at least one genre or mood');
      return;
    }

    setSubmittingPrefs(true);
    try {
      await watchPartyService.submitPreferences(id, selectedGenres, selectedMoods);
      fetchPartyDetails();
      alert('Preferences submitted successfully!');
    } catch (error) {
      console.error('Error submitting preferences:', error);
      alert('Failed to submit preferences');
    } finally {
      setSubmittingPrefs(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    setGeneratingRecs(true);
    try {
      await watchPartyService.generateGroupRecommendation(id);
      fetchPartyDetails();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert(error.response?.data?.message || 'Failed to generate recommendations');
    } finally {
      setGeneratingRecs(false);
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(party.inviteCode);
    alert('Invite code copied to clipboard!');
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!party) {
    return null;
  }

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentMember = party.members.find(m => m.user?._id === currentUser._id);
  const hasResponded = currentMember?.hasResponded || false;
  const allResponded = party.members.every(m => m.hasResponded);
  const hasRecommendations = party.groupRecommendation?.movies?.length > 0;

  return (
    <div className="min-h-screen bg-black">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/watch-parties')} className="mb-4">
            ← Back to Parties
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{party.name}</h1>
              <p className="text-gray-400">
                Created by {party.createdBy.name}
              </p>
            </div>
            
            <div className="text-right">
              <div className="mb-2">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  party.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  party.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {party.status.toUpperCase()}
                </span>
              </div>
              
              {party.scheduledFor && (
                <p className="text-gray-400 text-sm">
                  📅 {new Date(party.scheduledFor).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Invite Code Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary-600/20 to-purple-600/20 border-primary-500/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Invite Code</h3>
              <p className="text-gray-400 text-sm">Share this code with friends to join</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-mono font-bold text-primary-400">
                {party.inviteCode}
              </div>
              <Button variant="outline" onClick={handleCopyInviteCode}>
                📋 Copy
              </Button>
            </div>
          </div>
        </Card>

        {/* Members */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Members ({party.members.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {party.members.map((member, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg">
                <img
                  src={member.user?.avatar || 'https://via.placeholder.com/150'}
                  alt={member.user?.name || member.guestName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {member.user?.name || member.guestName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {member.hasResponded ? '✓ Responded' : '⏳ Waiting...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Preferences Form (if not responded yet) */}
        {party.status === 'active' && !hasResponded && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Submit Your Preferences</h2>
            
            <div className="space-y-6">
              {/* Genres */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Favorite Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        if (selectedGenres.includes(genre)) {
                          setSelectedGenres(selectedGenres.filter(g => g !== genre));
                        } else {
                          setSelectedGenres([...selectedGenres, genre]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedGenres.includes(genre)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Moods */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Mood/Vibe</h3>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => {
                        if (selectedMoods.includes(mood)) {
                          setSelectedMoods(selectedMoods.filter(m => m !== mood));
                        } else {
                          setSelectedMoods([...selectedMoods, mood]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedMoods.includes(mood)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmitPreferences}
                disabled={submittingPrefs}
                fullWidth
              >
                {submittingPrefs ? 'Submitting...' : 'Submit Preferences'}
              </Button>
            </div>
          </Card>
        )}

        {/* Waiting for Others */}
        {party.status === 'active' && hasResponded && !allResponded && (
          <Card className="p-6 mb-8 bg-yellow-500/10 border-yellow-500/50">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⏳</div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Waiting for Others</h3>
                <p className="text-gray-400">
                  {party.members.filter(m => !m.hasResponded).length} member(s) haven't submitted their preferences yet
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Generate Recommendations Button */}
        {party.status === 'active' && allResponded && !hasRecommendations && (
          <Card className="p-6 mb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Everyone has responded!</h3>
              <p className="text-gray-400 mb-6">Ready to generate AI recommendations for the group?</p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerateRecommendations}
                disabled={generatingRecs}
              >
                {generatingRecs ? (
                  <>
                    <Loader size="sm" />
                    <span>AI is thinking...</span>
                  </>
                ) : (
                  '🤖 Generate Group Recommendations'
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Recommendations */}
        {hasRecommendations && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Group Recommendations</h2>
            
            {/* AI Explanation */}
            <Card className="p-6 mb-8 bg-primary-600/10 border-primary-600/30">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🤖</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-2">AI Says:</p>
                  <div className="text-gray-200 whitespace-pre-line">
                    {party.groupRecommendation.explanation}
                  </div>
                </div>
              </div>
            </Card>

            {/* Movies */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {party.groupRecommendation.movies.map((movie) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onClick={() => navigate(`/movie/${movie.tmdbId}`)}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default WatchPartyDetails;