import React from 'react';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to the Voting System</h1>
      <p>Secure and easy online voting for everyone.</p>
      <div>
        <button 
          onClick={() => navigate('/login')}
          style={{ margin: '10px', padding: '10px 20px', cursor: 'pointer' }}
        >
          Login
        </button>
        <button 
          onClick={() => navigate('/register')}
          style={{ margin: '10px', padding: '10px 20px', cursor: 'pointer' }}
        >
          Register
        </button>
        <button 
          onClick={() => navigate('/candidate-details')}
          style={{ 
            margin: '10px', 
            padding: '10px 20px', 
            cursor: 'pointer',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          View Candidate Details
        </button>
      </div>
    </div>
  );
};

export default Homepage;