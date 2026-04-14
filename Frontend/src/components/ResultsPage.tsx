import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../App';
import { BarChart3, ArrowLeft, RefreshCw } from 'lucide-react';

interface ElectionStats {
  total_votes_cast: number;
  pending_votes: number;
  total_blocks: number;
  chain_valid: boolean;
  results: Record<string, number>;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [stats, setStats] = useState<ElectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('election-results/');
      if (response.data.status) {
        setStats(response.data.status);
      }
      if (response.data.results) {
        setResults(response.data.results);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-blue-900 font-semibold">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-900 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-blue-900">Election Results</h1>
          <button
            onClick={fetchResults}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Votes', value: stats.total_votes_cast, color: 'bg-green-50', textColor: 'text-green-600' },
              { label: 'Pending Votes', value: stats.pending_votes, color: 'bg-blue-50', textColor: 'text-blue-600' },
              { label: 'Blocks Mined', value: stats.total_blocks, color: 'bg-orange-50', textColor: 'text-orange-600' },
              { label: 'Chain Status', value: stats.chain_valid ? '✓ Valid' : '✗ Invalid', color: stats.chain_valid ? 'bg-green-50' : 'bg-red-50', textColor: stats.chain_valid ? 'text-green-600' : 'text-red-600' }
            ].map((stat, idx) => (
              <div key={idx} className={`${stat.color} rounded-xl p-6 border-2 border-gray-200`}>
                <p className="text-gray-600 font-semibold mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Results Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-8 h-8 text-blue-900" />
            <h2 className="text-3xl font-bold text-blue-900">Vote Count by Candidate</h2>
          </div>

          {results && Object.keys(results).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(results)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .map(([candidate, votes], idx) => {
                  const maxVotes = Math.max(...Object.values(results as Record<string, number>));
                  const percentage = ((votes as number) / maxVotes) * 100;

                  return (
                    <div key={candidate} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                          <span className="text-xl font-bold text-gray-800">{candidate}</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-900">{votes} votes</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-red-500 h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No votes recorded yet</p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-900 font-semibold">
            Results are updated in real-time from the blockchain. 
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;