import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VoteThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidateName, candidateParty } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Voting!</h1>
        <p className="text-gray-600 mb-6">
          Your vote has been successfully recorded.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">You voted for</p>
          <p className="text-lg font-bold text-gray-900">{candidateName || 'your candidate'}</p>
          <p className="text-sm text-gray-600">{candidateParty}</p>
        </div>
        
        <button
          onClick={() => navigate('/results')}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          View Election Results
        </button>
      </div>
    </div>
  );
};

export default VoteThankYou;