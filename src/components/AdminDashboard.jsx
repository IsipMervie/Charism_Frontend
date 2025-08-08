// frontend/src/components/AdminDashboard.jsx
// Simple but Creative Admin Dashboard Design

import React, { useEffect, useState } from 'react';
import { Container, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAnalytics } from '../api/api';
import axios from 'axios';
import { FaUsers, FaCalendarAlt, FaChartBar, FaTrophy, FaUserCheck, FaEnvelope, FaCog, FaBuilding } from 'react-icons/fa';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [schoolLoading, setSchoolLoading] = useState(true);
  const [schoolError, setSchoolError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setAnalytics(null);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const fetchSchool = async () => {
      setSchoolLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/settings/school', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchool(res.data);
        setSchoolError('');
      } catch {
        setSchoolError('Failed to fetch school info.');
      }
      setSchoolLoading(false);
    };
    fetchSchool();
  }, []);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`admin-dashboard-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <div className="icon-symbol">⚙️</div>
            </div>
            <div className="header-text">
              <h1 className="header-title">Admin Dashboard</h1>
              <p className="header-subtitle">Welcome to the Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* School Info Card */}
        <div className="school-info-card">
          <div className="school-info-content">
            <div className="school-logo-section">
              {schoolLoading ? (
                <div className="logo-loading">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : school && school.logo ? (
                <img
                  src={`/uploads/${school.logo}`}
                  alt="School Logo"
                  className="school-logo"
                />
              ) : (
                <div className="logo-placeholder">
                  <FaBuilding className="logo-icon" />
                </div>
              )}
            </div>
            <div className="school-info-section">
              {schoolLoading ? (
                <div className="school-loading">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : school ? (
                <>
                  <h3 className="school-name">{school.schoolName}</h3>
                  <div className="school-contact">
                    <span className="contact-label">Contact Email:</span>
                    <span className="contact-value">{school.contactEmail}</span>
                  </div>
                </>
              ) : (
                <Alert variant="danger" className="school-error">
                  {schoolError || 'No school info found.'}
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="action-buttons-grid">
          <button 
            className="action-button manage-users-button"
            onClick={() => navigate('/admin/manage-users')}
          >
            <FaUsers className="button-icon" />
            <span className="button-text">Manage Users</span>
          </button>

          <button 
            className="action-button manage-events-button"
            onClick={() => navigate('/admin/manage-events')}
          >
            <FaCalendarAlt className="button-icon" />
            <span className="button-text">Manage Events</span>
          </button>

          <button 
            className="action-button analytics-button"
            onClick={() => navigate('/analytics')}
          >
            <FaChartBar className="button-icon" />
            <span className="button-text">Analytics</span>
          </button>

          <button 
            className="action-button completed-button"
            onClick={() => navigate('/students-40-hours')}
          >
            <FaTrophy className="button-icon" />
            <span className="button-text">Completed</span>
          </button>

          <button 
            className="action-button staff-approvals-button"
            onClick={() => navigate('/admin/staff-approvals')}
          >
            <FaUserCheck className="button-icon" />
            <span className="button-text">Staff Approvals</span>
          </button>

          <button 
            className="action-button manage-messages-button"
            onClick={() => navigate('/admin/manage-messages')}
          >
            <FaEnvelope className="button-icon" />
            <span className="button-text">Manage Messages</span>
          </button>

          <button 
            className="action-button school-settings-button"
            onClick={() => navigate('/admin/school-settings')}
          >
            <FaCog className="button-icon" />
            <span className="button-text">School Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;