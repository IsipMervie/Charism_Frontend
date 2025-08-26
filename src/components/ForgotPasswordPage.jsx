// frontend/src/components/ForgotPasswordPage.jsx
// Simple but Creative Forgot Password Page Design

import React, { useState, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Password reset link sent! Check your email.',
      });
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (
        msg.toLowerCase().includes('old password') ||
        msg.toLowerCase().includes('previous password')
      ) {
        Swal.fire({
          icon: 'warning',
          title: "Don't Use Old Password",
          text: 'You cannot use your old password. Please enter a new one.',
        });
      } else if (msg === 'User not found') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'User not found.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error sending reset link.',
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-background">
        <div className="background-pattern"></div>
      </div>

      <Container className={`forgot-password-container ${isVisible ? 'visible' : ''}`}>
        <div className="forgot-password-card">
          {/* Header */}
          <div className="forgot-password-header">
            <div className="forgot-password-icon">
              <div className="icon-symbol">🔐</div>
            </div>
            <h1 className="forgot-password-title">Reset Password</h1>
            <p className="forgot-password-subtitle">Enter your email to receive a reset link</p>
          </div>

          {/* Form */}
          <Form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-field">
              <div className="input-wrapper">
                <Form.Control
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
                <div className="input-focus-line"></div>
              </div>
              <div className="form-hint">We'll send you a secure link to reset your password</div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className={`forgot-password-button ${loading ? 'loading' : ''}`}
            >
              <span className="button-content">
                {loading ? 'Sending reset link...' : 'Send Reset Link'}
              </span>
            </Button>
          </Form>

          {/* Help Section */}
          <div className="help-section">
            <div className="help-item">
              <div className="help-icon">📧</div>
              <div className="help-text">
                <h4>Check Your Email</h4>
                <p>Look for an email from CHARISM with your reset link</p>
              </div>
            </div>
            <div className="help-item">
              <div className="help-icon">⏰</div>
              <div className="help-text">
                <h4>Link Expires</h4>
                <p>Reset links expire after 24 hours for security</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default ForgotPasswordPage;