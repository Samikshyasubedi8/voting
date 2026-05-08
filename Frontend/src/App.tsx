import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import axios from 'axios';

// Component Imports
import Login from './components/Login';
import Register from './components/Register';
import VoterIdDisplay from './components/VoterIdDisplay';
import AuthLayout from './components/AuthLayout';
import Toast from './components/Toast';
import VotingPage from './components/VotingPage';
import VotingWelcome from './components/VotingWelcome';
import Homepage from './components/Homepage';
import CandidateDetails from './components/CandidateDetails';
import ResultsPage from './components/ResultsPage';
import VoteThankYou from './components/VoteThankYou';
import AdminResultsControl from './components/AdminResultscontrol';
import ProtectedRoute from './components/ProtectedRoute';


// Utility Imports
import { isAuthenticated } from './utils/authHelpers';

/**
 * 1. AXIOS CONFIGURATION
 * We create an instance so you don't have to type the full URL every time.
 */
export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Change this to your Django URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function App() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 2. CHECK AUTH ON LOAD
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Token exists, user is authenticated
      // Optional: Add a call to api.get('verify-token/') here to check if token is expired
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  return (
    <Router>
      <div className="font-sans antialiased text-gray-900">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/candidate-details" element={<CandidateDetails />} />
          <Route path="/admin/results" element={<AdminResultsControl />} />
          <Route path="/results" element={<ResultsPage />} />

          {/* LOGIN ROUTE */}
          <Route 
            path="/login" 
            element={
              isAuthenticated() ? (
                <Navigate to="/welcome" replace />
              ) : (
                <AuthLayout>
                  <Login onToast={showToast} />
                </AuthLayout>
              )
            } 
          />

          {/* REGISTER ROUTE */}
          <Route 
            path="/register" 
            element={
              <AuthLayout>
                <Register onToast={showToast} />
              </AuthLayout>
            } 
          />

          {/* VOTER ID DISPLAY */}
          <Route 
            path="/voter-id" 
            element={
              <AuthLayout>
                <VoterIdDisplay />
              </AuthLayout>
            } 
          />

          {/* PROTECTED ROUTES */}
          {/* WELCOME PAGE (Protected) */}
          <Route 
            path="/welcome" 
            element={
              <ProtectedRoute>
                <VotingWelcome />
              </ProtectedRoute>
            } 
          />

          {/* VOTING PAGE (Protected) */}
          <Route 
            path="/voting" 
            element={
              <ProtectedRoute>
                <VotingPage />
              </ProtectedRoute>
            } 
          />

          {/* THANK YOU PAGE (Protected) */}
          <Route 
            path="/vote-thankyou" 
            element={
              <ProtectedRoute>
                <VoteThankYou />
              </ProtectedRoute>
            } 
          />

          {/* ADMIN PAGE (Protected) */}
          <Route 
            path="/admin/results-control" 
            element={
              <ProtectedRoute>
                <AdminResultsControl />
              </ProtectedRoute>
            } 
          />

          {/* REDIRECTS */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* TOAST NOTIFICATIONS */}
        <AnimatePresence>
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}