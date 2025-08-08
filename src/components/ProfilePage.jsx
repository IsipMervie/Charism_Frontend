// frontend/src/components/ProfilePage.jsx
// Fresh Modern Profile Page Design

import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaUserTie, FaIdCard, FaGraduationCap, 
  FaBuilding, FaCalendar, FaEdit, FaCrown, FaUserGraduate,
  FaSpinner, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import './ProfilePage.css';

function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setName(user.name || '');
    setEmail(user.email || '');
    setRole(user.role || '');
    setUserId(user.userId || '');
    setAcademicYear(user.academicYear || '');
    setDepartment(user.department || '');
    setLoading(false);
  }, []);

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <FaCrown />;
      case 'staff':
        return <FaUserTie />;
      case 'student':
        return <FaUserGraduate />;
      default:
        return <FaUser />;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#ef4444';
      case 'staff':
        return '#3b82f6';
      case 'student':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'staff':
        return 'Staff Member';
      case 'student':
        return 'Student';
      default:
        return role || 'User';
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-section">
          <div className="loading-content">
            <FaSpinner className="loading-spinner" />
            <h3>Loading Profile</h3>
            <p>Please wait while we fetch your profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`profile-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-symbol">
              {getRoleIcon(role)}
            </div>
            <div className="role-badge" style={{ backgroundColor: getRoleColor(role) }}>
              {getRoleBadge(role)}
            </div>
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">{name || 'User Name'}</h1>
            <p className="profile-email">{email}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <FaCalendar className="stat-icon" />
                <span className="stat-label">Member Since</span>
                <span className="stat-value">2024</span>
              </div>
              <div className="stat-item">
                <FaBuilding className="stat-icon" />
                <span className="stat-label">Department</span>
                <span className="stat-value">{department || 'Not Assigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="profile-details">
          <div className="details-header">
            <h2 className="details-title">
              <FaUser className="details-icon" />
              Profile Information
            </h2>
            <p className="details-subtitle">Your account details and preferences</p>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <div className="detail-header">
                <FaUser className="detail-icon" />
                <span className="detail-label">Full Name</span>
              </div>
              <div className="detail-value">{name || 'Not provided'}</div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <FaEnvelope className="detail-icon" />
                <span className="detail-label">Email Address</span>
              </div>
              <div className="detail-value">{email || 'Not provided'}</div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <FaIdCard className="detail-icon" />
                <span className="detail-label">User ID</span>
              </div>
              <div className="detail-value">{userId || 'Not provided'}</div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <FaUserTie className="detail-icon" />
                <span className="detail-label">Account Role</span>
              </div>
              <div className="detail-value">
                <span className="role-display" style={{ color: getRoleColor(role) }}>
                  {getRoleIcon(role)}
                  {getRoleBadge(role)}
                </span>
              </div>
            </div>

            {academicYear && (
              <div className="detail-card">
                <div className="detail-header">
                  <FaGraduationCap className="detail-icon" />
                  <span className="detail-label">Academic Year</span>
                </div>
                <div className="detail-value">{academicYear}</div>
              </div>
            )}

            {department && (
              <div className="detail-card">
                <div className="detail-header">
                  <FaBuilding className="detail-icon" />
                  <span className="detail-label">Department</span>
                </div>
                <div className="detail-value">{department}</div>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="message-section">
            <div className="message-content">
              <FaCheckCircle className="message-icon" />
              <span className="message-text">{message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;