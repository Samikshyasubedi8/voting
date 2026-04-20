import React, { useState } from 'react';
import { api } from '../App';
import { useNavigate } from 'react-router-dom';

const VotingPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    // Fetch candidates
    api.get('candidates/').then(res => setCandidates(res.data));
  }, []);

  const handleVote = async () => {
    if (!selectedCandidate) {
      setMessage('Please select a candidate');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        'vote-custom-hash/',
        { candidate_id: selectedCandidate },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );

      setMessage(`Vote recorded! Hash: ${response.data.vote_hash.substring(0, 20)}...`);
      setSelectedCandidate(null);
    } catch (error) {
      setMessage('Voting failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Cast Your Vote</h1>
      
      <div>
        {candidates.map(candidate => (
          <div key={candidate.id} style={{ margin: '10px', padding: '10px', border: '1px solid #ccc' }}>
            <input
              type="radio"
              name="candidate"
              value={candidate.id}
              checked={selectedCandidate === candidate.id}
              onChange={() => setSelectedCandidate(candidate.id)}
            />
            <label style={{ marginLeft: '10px' }}>
              {candidate.name} - {candidate.party}
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={loading}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Recording Vote...' : 'Submit Vote'}
      </button>

      {message && <p style={{ marginTop: '20px', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default VotingPage;