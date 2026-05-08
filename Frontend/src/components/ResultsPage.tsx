import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

interface CandidateResult {
  name: string;
  party: string;
  votes: number;
  image: string | null;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [winner, setWinner] = useState<CandidateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('results/');
      
      if (!response.data.results_available) {
        setMessage(response.data.message);
        setIsLive(false);
        setResults([]);
      } else {
        setResults(response.data.results);
        setTotalVotes(response.data.total_votes_cast);
        setIsLive(response.data.is_result_live);
        setWinner(response.data.winner);
        setMessage('');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!isLive && message) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Results Not Available Yet</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Election Results</h1>
          {isLive && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              OFFICIAL RESULTS - Published
            </div>
          )}
        </div>

        {winner && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 mb-8 text-center border-2 border-yellow-300">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Winner</h2>
            <p className="text-3xl font-bold text-yellow-700">{winner.name}</p>
            <p className="text-gray-600">{winner.party}</p>
            <p className="text-lg font-semibold mt-2">{winner.votes} votes</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Vote Count by Candidate</h2>
            <p className="text-sm text-gray-500">Total votes cast: {totalVotes}</p>
          </div>

          <div className="p-6 space-y-6">
            {results.map((candidate, idx) => {
              const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
              const isWinner = idx === 0;

              return (
                <div key={candidate.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`font-semibold ${isWinner ? 'text-yellow-700' : 'text-gray-800'}`}>
                        {candidate.name}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">({candidate.party})</span>
                    </div>
                    <span className={`font-bold ${isWinner ? 'text-yellow-700' : 'text-blue-600'}`}>
                      {candidate.votes} votes
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${isWinner ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;