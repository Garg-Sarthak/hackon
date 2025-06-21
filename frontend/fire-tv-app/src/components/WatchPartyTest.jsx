import React from 'react';
import { useNavigate } from 'react-router-dom';

const WatchPartyTest = () => {
  const navigate = useNavigate();

  const testUrls = [
    { label: 'Solo Video (Video ID: 123)', url: '/video/123' },
    { label: 'Existing Party (Party ID: test-party-123)', url: '/party/test-party-123' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🎬 Watch Party Testing</h1>
      <p>Use these links to test different watch party scenarios:</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {testUrls.map(({ label, url }) => (
          <button
            key={url}
            onClick={() => navigate(url)}
            style={{
              padding: '1rem',
              border: '2px solid #ff8a4c',
              borderRadius: '8px',
              background: 'transparent',
              color: '#ff8a4c',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#ff8a4c';
              e.target.style.color = '#1a1a1a';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#ff8a4c';
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>🔧 Debug Info</h3>
        <p><strong>Environment:</strong></p>
        <ul>
          <li>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8080'}</li>
          <li>Backend URL: {import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}</li>
        </ul>
        
        <p><strong>How to test:</strong></p>
        <ol>
          <li>Click "Solo Video" to test solo viewing and party creation</li>
          <li>Create a party from solo view</li>
          <li>Open the party URL in another browser tab</li>
          <li>Test chat and playback controls</li>
        </ol>
      </div>
    </div>
  );
};

export default WatchPartyTest;
