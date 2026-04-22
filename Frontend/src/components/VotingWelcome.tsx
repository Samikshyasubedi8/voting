import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, Shield, Clock, CheckCircle } from 'lucide-react';

const VotingWelcome = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
            Welcome to Blockchain Voting
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your vote matters. Cast it securely on our blockchain-powered platform.
          </p>
        </div>

        {/* Welcome Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <h2 className="text-2xl font-bold text-white text-center">
              Hello, {userData.firstName || 'Voter'}!
            </h2>
            <p className="text-indigo-100 text-center mt-2">
              Ready to make your voice heard?
            </p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Blockchain Secured</h3>
                  <p className="text-sm text-gray-600">Your vote is encrypted and recorded on an immutable blockchain</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">One Vote Per Voter</h3>
                  <p className="text-sm text-gray-600">Each voter can cast only one vote, verified by blockchain</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Tamper-Proof</h3>
                  <p className="text-sm text-gray-600">SHA-256 hashing ensures your vote cannot be altered</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Vote className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Anonymous Voting</h3>
                  <p className="text-sm text-gray-600">Your identity is hashed and protected</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/voting')}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Start Voting Now
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingWelcome;