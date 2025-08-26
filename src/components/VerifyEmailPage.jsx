// frontend/src/components/VerifyEmailPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './VerifyEmailPage.css'; // Optional: for custom styles

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/auth/verify-email/${token}`);
        setMessage(response.data.message);
        setSuccess(true);
        
        // Show success SweetAlert
        Swal.fire({
          icon: 'success',
          title: '🎉 Email Verified Successfully!',
          text: 'Your email has been verified. You can now log in to your account.',
          confirmButtonText: 'Go to Login',
          confirmButtonColor: '#10b981',
          showCancelButton: true,
          cancelButtonText: 'Stay Here',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
        
      } catch (error) {
        let errorMessage = 'An error occurred while verifying your email.';
        let icon = 'error';
        
        if (error.response && error.response.data) {
          if (error.response.data.message.includes('already verified')) {
            errorMessage = 'This email is already verified. You can log in to your account.';
            icon = 'info';
          } else if (error.response.data.message.includes('Invalid or expired token')) {
            errorMessage = 'The verification link is invalid or has expired. Please request a new verification email.';
            icon = 'warning';
          } else {
            errorMessage = error.response.data.message;
          }
        }
        
        setMessage(errorMessage);
        setSuccess(false);
        
        // Show error SweetAlert
        Swal.fire({
          icon: icon,
          title: 'Email Verification Failed',
          text: errorMessage,
          confirmButtonText: 'OK',
          confirmButtonColor: icon === 'error' ? '#ef4444' : '#3b82f6'
        });
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="verify-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="verify-box" style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2>CHARISM Email Verification</h2>
        <p className={success ? 'success-message' : 'error-message'} style={{ color: success ? 'green' : 'red', fontWeight: 'bold' }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;