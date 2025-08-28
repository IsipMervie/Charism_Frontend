import React from 'react';
import { debugImageConfig } from '../utils/imageUtils';

const EnvironmentCheck = () => {
  const config = debugImageConfig();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <strong>🔍 Environment Debug:</strong><br/>
      REACT_APP_API_URL: {config.REACT_APP_API_URL || 'NOT SET'}<br/>
      BACKEND_URL: {config.BACKEND_URL}<br/>
      NODE_ENV: {config.NODE_ENV}<br/>
      <button onClick={() => window.location.reload()}>🔄 Reload</button>
    </div>
  );
};

export default EnvironmentCheck;
