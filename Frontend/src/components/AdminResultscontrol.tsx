import React, { useState, useEffect } from 'react';
import api from './api';

const AdminResultControl = () => {
  const [isLive, setIsLive] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStatus();
    fetchResults();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('admin/result-status/');
      setIsLive(response.data.is_result_live);
      setTotalVotes(response.data.total_votes_cast);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await api.get('results/');
      if (response.data.results_available) {
        setResults(response.data.results);
        setTotalVotes(response.data.total_votes_cast);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const calculateResults = async () => {
    setCalculating(true);
    setMessage('');
    try {
      const response = await api.post('admin/calculate-results/');
      setMessage(response.data.message);
      setTotalVotes(response.data.total_votes);
      setResults(
        Object.entries(response.data.results).map(([name, votes]) => ({
          name,
          votes,
          party: ''
        }))
      );
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error: ' + (error.response?.data?.error || 'Something went wrong'));
    } finally {
      setCalculating(false);
    }
  };

  const toggleResults = async (action: 'on' | 'off') => {
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('admin/toggle-results/', { action });
      setIsLive(response.data.is_result_live);
      setMessage(response.data.message);
      await fetchResults();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error: Admin access required');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Election Results Control Panel</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className={`text-2xl font-bold mb-2 ${isLive ? 'text-green-600' : 'text-red-600'}`}>
              {isLive ? '✅ RESULTS ARE LIVE' : '❌ RESULTS ARE HIDDEN'}
            </div>
            <p className="text-gray-600">Total votes cast: <strong>{totalVotes}</strong></p>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={calculateResults}
                disabled={calculating}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {calculating ? 'Calculating...' : '📊 Calculate Results from Blockchain'}
              </button>
              <button
                onClick={() => toggleResults('on')}
                disabled={loading || isLive}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : '📢 Publish Results (Make Live)'}
              </button>
              <button
                onClick={() => toggleResults('off')}
                disabled={loading || !isLive}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : '🔒 Hide Results'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Preview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Results Preview</h2>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((candidate, idx) => (
                <div key={idx} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{candidate.name}</span>
                      <span className="text-gray-500 ml-2">({candidate.party || 'N/A'})</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{candidate.votes} votes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No results yet. Click "Calculate Results" to fetch from blockchain.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminResultControl;