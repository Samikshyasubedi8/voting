import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

interface Candidate {
  id: number;
  name: string;
  party: string;
  position: string;
  votes_count: number;
  image: string;
}

const VotingPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [voteStatus, setVoteStatus] = useState<any>(null);

  useEffect(() => {
    fetchCandidates();
    checkVoteStatus();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('candidates/');
      setCandidates(response.data);
    } catch (err) {
      setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const response = await api.get('vote-status/');
      setVoteStatus(response.data);
    } catch (err) {
      console.error('Failed to check vote status:', err);
    }
  };

  const handleVoteClick = (candidate: Candidate) => {
    setShowConfirm(candidate);
  };

  const confirmVote = async () => {
    if (!showConfirm) return;
    
    setVoting(showConfirm.id);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Casting vote for candidate:', showConfirm.id);
      
      const response = await api.post('vote/', {
        candidate_id: showConfirm.id
      });
      
      console.log('Vote response:', response.data);
      
      setSuccess(`Your vote for ${showConfirm.name} has been recorded successfully!`);
      await fetchCandidates();
      await checkVoteStatus();
      setShowConfirm(null);
      
      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        navigate('/vote-thankyou', { 
          state: { candidateName: showConfirm.name, candidateParty: showConfirm.party }
        });
      }, 1500);
      
    } catch (err: any) {
      console.error('Vote error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to cast vote. Please try again.';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setVoting(null);
    }
  };

  const closeModal = () => {
    setShowConfirm(null);
  };


  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user has already voted
  if (voteStatus?.has_voted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You Have Voted</h1>
          <p className="text-gray-600 mb-6">
            Thank you for participating in the election.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/results')}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              View Results
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cast Your Vote</h1>
          <p className="text-gray-600">Select your preferred candidate</p>
        </div>

        {error && (
          <div className="mb-6 max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 rounded-lg p-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 max-w-md mx-auto bg-green-100 border border-green-400 text-green-700 rounded-lg p-4 text-center">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                {getImageUrl(candidate.image) ? (
                  <img
                    src={getImageUrl(candidate.image)!}
                    alt={candidate.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-indigo-600">
                      {candidate.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-5 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h2>
                <p className="text-sm text-gray-500 mb-3">{candidate.party}</p>
                <p className="text-xs text-gray-400 mb-4">{candidate.position}</p>
                
                <button
                  onClick={() => handleVoteClick(candidate)}
                  disabled={voting === candidate.id}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    voting === candidate.id
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {voting === candidate.id ? 'Processing...' : 'Vote'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal - Clean, no blockchain mentions */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Your Vote</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to vote for:
            </p>
            <div className="bg-indigo-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-lg font-bold text-indigo-900">{showConfirm.name}</p>
              <p className="text-gray-600">{showConfirm.party}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                ⚠️ This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                disabled={voting === showConfirm.id}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {voting === showConfirm.id ? 'Processing...' : 'Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;