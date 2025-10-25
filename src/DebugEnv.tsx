import React from 'react';

const DebugEnv = () => {
  const agoraAppId = import.meta.env.VITE_AGORA_APP_ID;
  const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

  return (
    <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px', borderRadius: '5px' }}>
      <h3>Environment Variables Debug:</h3>
      <p><strong>VITE_AGORA_APP_ID:</strong> {agoraAppId ? `"${agoraAppId}"` : 'NOT FOUND'}</p>
      <p><strong>VITE_FIREBASE_API_KEY:</strong> {firebaseApiKey ? 'FOUND' : 'NOT FOUND'}</p>
      <p><strong>All env vars:</strong></p>
      <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
    </div>
  );
};

export default DebugEnv;