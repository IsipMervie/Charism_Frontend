// frontend/src/components/LoginPage.jsx
// Simple but Creative Login Page Design

import React, { useState, useEffect } from 'react';
import { Button, Form, Container } from 'react-bootstrap';
import { loginUser } from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await loginUser(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
      window.dispatchEvent(new Event('userChanged'));
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome, ${user.name || user.email}!`,
        timer: 1500,
        showConfirmButton: false,
      });
      switch (user.role) {
        case 'Admin': navigate('/admin/dashboard'); break;
        case 'Staff': navigate('/staff/dashboard'); break;
        case 'Student': navigate('/student/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err?.response?.data?.message || 'Invalid credentials. Please try again.',
      });
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="background-pattern"></div>
      </div>

      <Container className={`login-container ${isVisible ? 'visible' : ''}`}>
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="brand-logo">
              <div className="logo-symbol">CL</div>
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          {/* Form */}
          <Form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <div className="input-wrapper">
                <Form.Control
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
                <div className="input-focus-line"></div>
              </div>
            </div>

            <div className="form-field">
              <div className="input-wrapper">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <div className="input-focus-line"></div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className={`login-button ${loading ? 'loading' : ''}`}
            >
              <span className="button-content">
                {loading ? 'Signing in...' : 'Sign In'}
              </span>
            </Button>
          </Form>

          {/* Links */}
          <div className="login-links">
            <Link to="/forgot-password" className="link-text">
              Forgot your password?
            </Link>
            <div className="divider">
              <span>or</span>
            </div>
            <Link to="/register" className="link-text">
              Create new account
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default LoginPage;