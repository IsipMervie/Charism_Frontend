// frontend/src/components/VerifyEmailPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmailPage.css'; // Optional: for custom styles

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/auth/verify-email/${token}`);
        setMessage(response.data.message);
        setSuccess(true);
      } catch (error) {
        if (error.response && error.response.data) {
          setMessage(error.response.data.message);
        } else {
          setMessage('Error verifying email.');
        }
        setSuccess(false);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="verify-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="verify-box" style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2>CommunityLink Email Verification</h2>
        <p className={success ? 'success-message' : 'error-message'} style={{ color: success ? 'green' : 'red', fontWeight: 'bold' }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;