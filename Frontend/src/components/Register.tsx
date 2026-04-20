import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, User, IdCard, MapPin, ChevronDown, ShieldCheck, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface RegisterProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

const DISTRICT_DATA: Record<string, Record<string, number>> = {
  'Kathmandu': {
    'Kathmandu Metropolitan City': 32,
    'Budhanilkantha Municipality': 13,
    'Tarakeshwar Municipality': 11,
    'Gokarneshwar Municipality': 9,
    'Chandragiri Municipality': 15,
    'Tokha Municipality': 11,
    'Kageshwari-Manohara Municipality': 9,
    'Nagarjun Municipality': 10,
    'Kirtipur Municipality': 10,
    'Shankharapur Municipality': 9,
    'Dakshinkali Municipality': 9
  },
  'Bhaktapur': {
    'Bhaktapur Municipality': 10,
    'Changunarayan Municipality': 11,
    'Madhyapur Thimi Municipality': 9,
    'Suryabinayak Municipality': 8
  },
  'Lalitpur': {
    'Lalitpur Metropolitan City': 29,
    'Godavari Municipality': 14,
    'Mahalaxmi Municipality': 10,
    'Konjyosom Rural Municipality': 5,
    'Bagmati Rural Municipality': 7,
    'Mahankal Rural Municipality': 6
  }
};

export default function Register({ onToast }: RegisterProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    district: '',
    municipality: '',
    ward: '',
    citizenship_no: '',
    password: '',
    confirm_password: '',
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const validateCitizenship = (num: string) => {
    const pattern = /^\d{2}-\d{2}-\d{2}-\d{5}$/;
    return pattern.test(num);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: val };
      // Reset municipality and ward if district changes
      if (name === 'district') {
        newData.municipality = '';
        newData.ward = '';
      }
      // Reset ward if municipality changes
      if (name === 'municipality') {
        newData.ward = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCitizenship(formData.citizenship_no)) {
      onToast('Invalid Citizenship Number format. Expected: XX-XX-XX-XXXXX', 'error');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      onToast('Passwords do not match', 'error');
      return;
    }

    if (!formData.terms) {
      onToast('You must agree to the terms and conditions', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const csrfToken = await ensureCsrfToken();
      const response = await fetch('/api/register/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        onToast(`Registration successful!`, 'success');
        navigate('/voter-id', { state: { voterId: data.voterId } });
      } else {
        onToast(data.message || 'Registration failed.', 'error');
      }
    } catch (error) {
      onToast('Registration failed. Check server logs.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const municipalities = formData.district ? Object.keys(DISTRICT_DATA[formData.district]) : [];
  const wardCount = (formData.district && formData.municipality) ? DISTRICT_DATA[formData.district][formData.municipality] : 0;

  return (
    <div className="w-full max-w-md space-y-6 py-4">
      <div className="text-left">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create account</h2>
        <p className="mt-2 text-sm text-gray-600">Please enter your details to sign up.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="John"
              />
            </div>
          </div>
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="Doe"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date of Birth</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                name="date_of_birth"
                type="date"
                required
                value={formData.date_of_birth}
                onChange={handleChange}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Citizenship No.</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdCard className="h-4 w-4 text-gray-400" />
              </div>
              <input
                name="citizenship_no"
                type="text"
                required
                value={formData.citizenship_no}
                onChange={handleChange}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="XX-XX-XX-XXXXX"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Permanent Address</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">District</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-xl leading-5 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                >
                  <option value="">Select District</option>
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Bhaktapur">Bhaktapur</option>
                  <option value="Lalitpur">Lalitpur</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Municipality</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  name="municipality"
                  required
                  value={formData.municipality}
                  onChange={handleChange}
                  disabled={!formData.district}
                  className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-xl leading-5 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 disabled:bg-gray-100"
                >
                  <option value="">Select Municipality</option>
                  {municipalities.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Ward</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <select
                name="ward"
                required
                value={formData.ward}
                onChange={handleChange}
                disabled={!formData.municipality}
                className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-xl leading-5 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 disabled:bg-gray-100"
              >
                <option value="">Select Ward</option>
                {formData.municipality && [...Array(wardCount)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Ward {String(i + 1).padStart(2, '0')}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="relative">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              name="confirm_password"
              type="password"
              required
              value={formData.confirm_password}
              onChange={handleChange}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={formData.terms}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="terms" className="ml-2 block text-xs text-gray-700 cursor-pointer">
            I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms and Conditions</a>
          </label>
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
              'Sign Up'
            )}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign In
        </Link>
      </p>
    </div>
  );
}
