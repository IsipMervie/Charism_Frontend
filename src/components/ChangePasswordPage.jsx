// frontend/src/components/ChangePasswordPage.jsx
// Simple but Creative Change Password Page Design

import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { changePassword } from '../api/api';
import Swal from 'sweetalert2';
import './ChangePasswordPage.css';

function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // No minimum length requirement per your request
    if (newPassword === oldPassword) {
      Swal.fire({ icon: 'warning', title: "Don't Use Old Password", text: 'Please choose a new password different from your current password.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New passwords do not match.',
      });
      return;
    }
    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      Swal.fire({
        icon: 'success',
        title: 'Password Changed',
        text: 'Password changed successfully!',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Failed to change password.',
      });
    }
    setLoading(false);
  };

  return (
    <div className="change-password-page">
      <div className="change-password-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`change-password-container ${isVisible ? 'visible' : ''}`}>
        <div className="change-password-card">
          {/* Header */}
          <div className="change-password-header">
            <div className="change-password-icon">
              <div className="icon-symbol">🔒</div>
            </div>
            <h1 className="change-password-title">Change Password</h1>
            <p className="change-password-subtitle">Update your password to keep your account secure</p>
          </div>

          {/* Form */}
          <Form onSubmit={handleSubmit} className="change-password-form">
            <div className="form-section">
              <h3 className="section-title">Password Information</h3>
              
              <div className="form-field">
                <div className="input-wrapper">
                  <Form.Control
                    type="password"
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                    className="form-input"
                  />
                  <div className="input-focus-line"></div>
                </div>
                <div className="form-hint">Enter your current password to verify your identity</div>
              </div>

              <div className="form-field">
                <div className="input-wrapper">
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="form-input"
                  />
                  <div className="input-focus-line"></div>
                </div>
                <div className="form-hint">Choose a new password different from your current one</div>
              </div>

              <div className="form-field">
                <div className="input-wrapper">
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    required
                    className="form-input"
                  />
                  <div className="input-focus-line"></div>
                </div>
                <div className="form-hint">Re-enter your new password to confirm</div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className={`change-password-button ${loading ? 'loading' : ''}`}
            >
              <span className="button-content">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2"/>
                    Updating password...
                  </>
                ) : (
                  'Update Password'
                )}
              </span>
            </Button>
          </Form>


        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;