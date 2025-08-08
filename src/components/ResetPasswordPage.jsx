// frontend/src/components/ResetPasswordPage.jsx
// Simple but Creative Reset Password Page Design

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ResetPasswordPage.css';

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Passwords do not match.'
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Password reset successful! You can now log in.'
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message === 'Cannot reuse old password') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'You cannot use your old password. Please choose a new one.'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Invalid or expired token.'
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-background">
        <div className="background-pattern"></div>
      </div>

      <Container className={`reset-password-container ${isVisible ? 'visible' : ''}`}>
        <div className="reset-password-card">
          {/* Header */}
          <div className="reset-password-header">
            <div className="reset-password-icon">
              <div className="icon-symbol">🔑</div>
            </div>
            <h1 className="reset-password-title">Set New Password</h1>
            <p className="reset-password-subtitle">Create a strong password for your account</p>
          </div>

          {/* Form */}
          <Form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-section">
              <h3 className="section-title">Password Details</h3>
              
              <div className="form-field">
                <div className="input-wrapper">
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="form-input"
                  />
                  <div className="input-focus-line"></div>
                </div>
                <div className="form-hint">Choose a strong password with at least 8 characters</div>
              </div>

              <div className="form-field">
                <div className="input-wrapper">
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="form-input"
                  />
                  <div className="input-focus-line"></div>
                </div>
                <div className="form-hint">Re-enter your password to confirm</div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className={`reset-password-button ${loading ? 'loading' : ''}`}
            >
              <span className="button-content">
                {loading ? 'Updating password...' : 'Update Password'}
              </span>
            </Button>
          </Form>

          {/* Security Tips */}
          <div className="security-tips">
            <div className="tips-header">
              <div className="tips-icon">💡</div>
              <h4>Password Tips</h4>
            </div>
            <div className="tips-list">
              <div className="tip-item">
                <div className="tip-icon">✅</div>
                <span>Use at least 8 characters</span>
              </div>
              <div className="tip-item">
                <div className="tip-icon">✅</div>
                <span>Include uppercase and lowercase letters</span>
              </div>
              <div className="tip-item">
                <div className="tip-icon">✅</div>
                <span>Add numbers and special characters</span>
              </div>
              <div className="tip-item">
                <div className="tip-icon">✅</div>
                <span>Avoid common words or phrases</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default ResetPasswordPage;