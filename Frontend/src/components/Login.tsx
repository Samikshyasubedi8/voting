import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface LoginProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

export default function Login({ onToast }: LoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const getCookie = (name: string) => {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`));
    return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : '';
  };

  const ensureCsrfToken = async () => {
    await fetch('/api/voting/csrf/', { method: 'GET', credentials: 'include' });
    return getCookie('csrftoken');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const csrfToken = await ensureCsrfToken();
      const response = await fetch('/api/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        if (data.user) {
          localStorage.setItem('user_data', JSON.stringify(data.user));
        }
        onToast('Welcome back! Login successful.', 'success');
        navigate('/welcome');
      } else {
        const errorData = await response.json();
        onToast(errorData.message || 'Invalid credentials. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      onToast('Login failed. Please check your connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-left">
        <h2 className="text-sm font-bold text-gray-500 tracking-tight">Please enter your details to sign in.</h2>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Voter ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="Enter your Voter ID"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Remember me
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-70"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
