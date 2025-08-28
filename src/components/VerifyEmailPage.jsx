// frontend/src/components/VerifyEmailPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './VerifyEmailPage.css';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setMessage('No verification token provided');
        setSuccess(false);
        setLoading(false);
        return;
      }

      try {
        // Use the correct API endpoint
        const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/auth/verify-email/${token}`);
        
        if (response.data && response.data.message) {
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
        }
        
      } catch (error) {
        console.error('Email verification error:', error);
        
        let errorMessage = 'An error occurred while verifying your email.';
        let icon = 'error';
        
        if (error.response && error.response.data) {
          if (error.response.data.message.includes('already verified')) {
            errorMessage = 'This email is already verified. You can log in to your account.';
            icon = 'info';
          } else if (error.response.data.message.includes('Invalid or expired token')) {
            errorMessage = 'The verification link is invalid or has expired. Please request a new verification email.';
            icon = 'warning';
          } else if (error.response.data.message.includes('User not found')) {
            errorMessage = 'User account not found. Please check your verification link.';
            icon = 'error';
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
          icon = 'warning';
        }
        
        setMessage(errorMessage);
        setSuccess(false);
        
        // Show error SweetAlert
        Swal.fire({
          icon: icon,
          title: 'Email Verification Failed',
          text: errorMessage,
          confirmButtonText: 'OK',
          confirmButtonColor: icon === 'error' ? '#ef4444' : '#3b82f6',
          showCancelButton: true,
          cancelButtonText: 'Go to Login',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            navigate('/login');
          }
        });
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="verify-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="verify-box" style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status" style={{ marginBottom: '16px' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h2>Verifying Email...</h2>
          <p>Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="verify-box" style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px' }}>
        <h2 style={{ color: '#1e40af', marginBottom: '16px' }}>CHARISM Email Verification</h2>
        <p className={success ? 'success-message' : 'error-message'} style={{ 
          color: success ? '#10b981' : '#ef4444', 
          fontWeight: 'bold',
          fontSize: '16px',
          lineHeight: '1.5',
          marginBottom: '24px'
        }}>
          {message}
        </p>
        
        {!success && (
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: '#1e40af',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginRight: '12px'
              }}
            >
              Go to Login
            </button>
            <button 
              onClick={() => navigate('/')}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;