import { useNavigate } from 'react-router-dom';
import { LogOut, Vote } from 'lucide-react';
import { clearAuthData, getUserName } from '../utils/authHelpers';

const VotingWelcome = () => {
  const navigate = useNavigate();
  const userName = getUserName();

  const handleLogout = () => {
    // Clear all user data from localStorage
    clearAuthData();

    // Redirect to home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hello, {userName}
            </h1>
            <p className="text-gray-500">Welcome to the voting portal</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Ready to Vote?</h2>
            <p className="text-gray-500 mt-2">Your vote is important. Make it count.</p>
          </div>
          
          <button
            onClick={() => navigate('/voting')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Cast Your Vote
          </button>
          
          <div className="mt-6">
            <button
              onClick={() => navigate('/results')}
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              View Results →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-500 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingWelcome;