import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button, Card, Input, Loader, Modal } from '../components/common';
import { watchPartyService } from '../services';

const WatchParty = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  
  // Create party form
  const [partyName, setPartyName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Join party form
  const [inviteCode, setInviteCode] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const response = await watchPartyService.getMyParties();
      setParties(response.data.parties);
    } catch (error) {
      console.error('Error fetching parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParty = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const response = await watchPartyService.createParty(
        partyName,
        scheduledDate || null
      );
      
      setShowCreateModal(false);
      setPartyName('');
      setScheduledDate('');
      
      // Navigate to party details
      navigate(`/watch-party/${response.data._id}`);
    } catch (error) {
      console.error('Error creating party:', error);
      alert('Failed to create party');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinParty = async (e) => {
    e.preventDefault();
    setJoinLoading(true);

    try {
      const response = await watchPartyService.joinParty(inviteCode.toUpperCase());
      
      setShowJoinModal(false);
      setInviteCode('');
      
      // Navigate to party details
      navigate(`/watch-party/${response.data._id}`);
    } catch (error) {
      console.error('Error joining party:', error);
      alert(error.response?.data?.message || 'Failed to join party. Check your invite code.');
    } finally {
      setJoinLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/50',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/50'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <Container className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Watch Parties</h1>
            <p className="text-gray-400">Create or join group movie sessions</p>
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setShowJoinModal(true)}
            >
              🎫 Join Party
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              ➕ Create Party
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        )}

        {/* Parties List */}
        {!loading && parties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parties.map((party) => (
              <Card
                key={party._id}
                className="p-6 hover:border-primary-500/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/watch-party/${party._id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{party.name}</h3>
                    {getStatusBadge(party.status)}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{party.members.length} member(s)</span>
                  </div>

                  {party.scheduledFor && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(party.scheduledFor).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-primary-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="font-mono font-semibold">{party.inviteCode}</span>
                  </div>
                </div>

                {/* Progress */}
                {party.status === 'active' && (
                  <div className="pt-4 border-t border-dark-border">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Responses</span>
                      <span className="text-white font-semibold">
                        {party.members.filter(m => m.hasResponded).length}/{party.members.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(party.members.filter(m => m.hasResponded).length / party.members.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Recommendations Ready */}
                {party.groupRecommendation?.movies?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dark-border">
                    <div className="flex items-center gap-2 text-green-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold">
                        Recommendations Ready! ({party.groupRecommendation.movies.length} movies)
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && parties.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Watch Parties Yet</h2>
            <p className="text-gray-400 mb-6">
              Create a party or join one with an invite code
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Your First Party
              </Button>
              <Button variant="outline" onClick={() => setShowJoinModal(true)}>
                Join with Code
              </Button>
            </div>
          </div>
        )}
      </Container>

      {/* Create Party Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Watch Party"
      >
        <form onSubmit={handleCreateParty} className="space-y-4">
          <Input
            label="Party Name"
            placeholder="Friday Movie Night"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            required
          />

          <Input
            label="Scheduled Date (Optional)"
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createLoading}
              fullWidth
            >
              {createLoading ? 'Creating...' : 'Create Party'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Party Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Watch Party"
      >
        <form onSubmit={handleJoinParty} className="space-y-4">
          <Input
            label="Invite Code"
            placeholder="ABC123"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
            className="text-center font-mono text-2xl tracking-widest"
          />

          <p className="text-sm text-gray-400 text-center">
            Enter the 6-character code shared by the party host
          </p>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowJoinModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={joinLoading || inviteCode.length !== 6}
              fullWidth
            >
              {joinLoading ? 'Joining...' : 'Join Party'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WatchParty;