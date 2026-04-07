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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await api.get('candidates/');
        console.log('Fetched candidates:', response.data);
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading candidates...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>{error}</div>;
  }

  if (candidates.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>No candidates found</div>;
  }

  const candidate = candidates[currentIndex];

  const nextCandidate = () => {
    setCurrentIndex((prev) => (prev + 1) % candidates.length);
  };

  const prevCandidate = () => {
    setCurrentIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Candidate Details</h1>
      
      {candidate.image && (
        <img 
          src={candidate.image} 
          alt={candidate.name} 
          style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '20px', objectFit: 'cover' }} 
        />
      )}
      
      <h2>{candidate.name}</h2>
      <p><strong>Party:</strong> {candidate.party}</p>
      <p><strong>Position:</strong> {candidate.position}</p>
      <p><strong>Votes:</strong> {candidate.votes_count}</p>
      <p>{candidate.bio}</p>
      
      <div style={{ marginTop: '30px', marginBottom: '20px' }}>
        <button 
          onClick={prevCandidate}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            cursor: 'pointer',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Previous
        </button>
        <span style={{ margin: '0 15px' }}>
          {currentIndex + 1} / {candidates.length}
        </span>
        <button 
          onClick={nextCandidate}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            cursor: 'pointer',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Next
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );
};

export default CandidateDetails;