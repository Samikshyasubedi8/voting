import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api  from './api';

interface Candidate {
  id: number;
  name: string;
  party: string;
  position: string;
  votes_count: number;
  image: string;
  bio: string;
}

interface BlockchainVoteResponse {
  success: boolean;
  message: string;
  blockchain_data: {
    voter_hash: string;
    vote_hash: string;
    candidate: string;
    candidate_id: number;
    timestamp: string;
    verified_on_blockchain: boolean;
    transaction_id: number;
  };
}

const VotingPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<BlockchainVoteResponse | null>(null);
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
      console.error(err);
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
      const response = await api.post<BlockchainVoteResponse>('blockchain-vote/', {
        candidate_id: showConfirm.id
      });
      
      setSuccess(response.data);
      
      // Refresh candidate list to show updated vote counts
      await fetchCandidates();
      await checkVoteStatus();
      
      // Close modal
      setShowConfirm(null);
      
      // Auto-hide success message after 10 seconds
      setTimeout(() => setSuccess(null), 10000);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cast vote. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setVoting(null);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  // If user has already voted, show thank you page
  if (voteStatus?.has_voted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Voting!</h1>
            <p className="text-gray-600">Your vote has been recorded on the blockchain.</p>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-indigo-900 mb-3">Vote Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Candidate:</span>
                <span className="font-semibold">{voteStatus.candidate_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">{voteStatus.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blockchain Verified:</span>
                <span className="text-green-600">✓ Yes</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Vote Hash (Blockchain Record)</p>
            <code className="text-xs text-gray-700 break-all">{voteStatus.vote_hash}</code>
          </div>
          
          <button
            onClick={() => navigate('/results')}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            View Election Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
            Cast Your Vote
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your vote will be securely recorded on the blockchain using SHA-256 encryption
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="inline-flex items-center px-3 py-1 bg-indigo-100 rounded-full text-sm">
              🔒 Blockchain Secured
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full text-sm">
              ✓ Anonymous Voting
            </span>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">✓ {success.message}</p>
                <p className="text-sm mt-1">Your vote for {success.blockchain_data.candidate} has been recorded.</p>
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer">View Blockchain Details</summary>
                  <div className="mt-2 p-2 bg-white rounded text-xs">
                    <p>Vote Hash: {success.blockchain_data.vote_hash}</p>
                    <p>Voter Hash: {success.blockchain_data.voter_hash}</p>
                    <p>Transaction ID: {success.blockchain_data.transaction_id}</p>
                    <p>Verified: {success.blockchain_data.verified_on_blockchain ? '✓ Yes' : '✗ No'}</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Candidate Image */}
              <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center relative">
                {getImageUrl(candidate.image) ? (
                  <img
                    src={getImageUrl(candidate.image)!}
                    alt={candidate.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                    <span className="text-white text-4xl font-bold">{candidate.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Candidate Info */}
              <div className="p-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {candidate.party}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Position:</span>
                    <span className="font-semibold">{candidate.position}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Current Votes:</span>
                    <span className="font-semibold text-green-600">{candidate.votes_count}</span>
                  </div>
                </div>

                {/* Vote Button */}
                <button
                  onClick={() => handleVoteClick(candidate)}
                  disabled={voting === candidate.id}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                    voting === candidate.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
                  }`}
                >
                  {voting === candidate.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Recording on Blockchain...
                    </span>
                  ) : (
                    'Vote on Blockchain'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/welcome')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold border-2 border-indigo-600 hover:bg-indigo-50"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 transform transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Blockchain Vote</h2>
            <p className="text-gray-600 mb-4">
              Your vote will be permanently recorded on the blockchain using SHA-256 encryption.
            </p>
            <div className="bg-indigo-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-xl font-bold text-indigo-900">{showConfirm.name}</p>
              <p className="text-indigo-600">{showConfirm.party}</p>
              <p className="text-sm text-gray-500 mt-2">{showConfirm.position}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-yellow-800">
                ⚠️ Blockchain transactions are irreversible. Once confirmed, your vote cannot be changed.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Confirm & Record on Blockchain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;