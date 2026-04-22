import { useNavigate } from 'react-router-dom';
import { api } from '../App';
import React, { useEffect, useState } from 'react';

interface Candidate {
  id: number;
  name: string;
  party: string;
  bio: string;
  image: string;
  position: string;
  votes_count: number;
}

const CandidateDetails = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  // Improved function to get full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slash to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Try different possible base URLs
    const possibleUrls = [
      `http://127.0.0.1:8000${cleanPath}`,
      `http://localhost:8000${cleanPath}`,
      `http://127.0.0.1:8000/media/${imagePath.replace(/^\/media\//, '')}`,
    ];
    
    // Return the first URL (we'll try fallbacks on error)
    return possibleUrls[0];
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await api.get('candidates/');
        console.log('Fetched candidates:', response.data);
        
        // Log image URLs for debugging
        response.data.forEach((candidate: Candidate) => {
          console.log(`Candidate ${candidate.name} image path:`, candidate.image);
        });
        
        setCandidates(response.data);
      } catch (err) {
        setError('Failed to load candidates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleImageError = (candidateId: number) => {
    setImageErrors(prev => ({ ...prev, [candidateId]: true }));
    console.log(`Failed to load image for candidate ID: ${candidateId}`);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-600 text-xl mb-2">⚠️ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-gray-600 text-xl">No candidates found</div>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
            Candidate Directory
          </h1>
          <p className="text-gray-600 text-lg">
            Get to know your candidates before you vote
          </p>
          <div className="mt-2 text-sm text-indigo-600 font-semibold">
            {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''} Available
          </div>
        </div>

        {/* Scrollable Cards Container */}
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto px-2 custom-scrollbar">
          {candidates.map((candidate, index) => {
            const imageUrl = getImageUrl(candidate.image);
            const hasImageError = imageErrors[candidate.id];
            
            return (
              <div
                key={candidate.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="md:flex">
                  {/* Image Section - Fixed */}
                  <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex items-center justify-center min-h-[250px]">
                    {imageUrl && !hasImageError ? (
                      <img
                        src={imageUrl}
                        alt={candidate.name}
                        className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={() => handleImageError(candidate.id)}
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                        <span className="text-white text-6xl font-bold">
                          {candidate.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="md:w-2/3 p-6">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {candidate.party}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold">Position:</span>
                        <span>{candidate.position}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Total Votes:</span>
                        <span className="text-green-600 font-bold">{candidate.votes_count.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Biography</h3>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {candidate.bio || "No biography available for this candidate."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        // You can add modal or detailed view here
                        console.log('View details for:', candidate.name);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
                    >
                      View Full Profile →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold border-2 border-indigo-600 hover:bg-indigo-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Homepage
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default CandidateDetails;