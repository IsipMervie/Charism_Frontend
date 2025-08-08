// frontend/src/components/SettingsPage.jsx
// Fresh Modern Settings Page Design

import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaIdCard, FaGraduationCap, FaBuilding, 
  FaCalendar, FaUserTie, FaSave, FaSpinner, FaCheckCircle, 
  FaExclamationTriangle, FaCog, FaUserGraduate
} from 'react-icons/fa';
import { getUserProfile, updateUserProfile, getPublicSettings } from '../api/api';
import './SettingsPage.css';

function SettingsPage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    userId: '',
    academicYear: '',
    year: '',
    section: '',
    department: '',
  });
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Settings options for dropdowns
  const [settings, setSettings] = useState({
    academicYears: [],
    yearLevels: [],
    sections: [],
    departments: [],
  });

  useEffect(() => {
    setIsVisible(true);
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const user = await getUserProfile();
        setProfile({
          name: user.name || '',
          email: user.email || '',
          userId: user.userId || '',
          academicYear: user.academicYear || '',
          year: user.year || '',
          section: user.section || '',
          department: user.department || '',
        });
        setRole(user.role || '');
        setError('');
      } catch (err) {
        setError('Failed to fetch profile. Please make sure you are logged in and your backend is running.');
      }
      setLoading(false);
    };

    const fetchSettings = async () => {
      try {
        const settingsData = await getPublicSettings();
        setSettings({
          academicYears: settingsData.academicYears?.map(a => a.year) || [],
          yearLevels: settingsData.yearLevels?.map(y => y.name) || [],
          sections: settingsData.sections?.map(s => s.name) || [],
          departments: settingsData.departments?.map(d => d.name) || [],
        });
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchProfile();
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await updateUserProfile(profile);
      setMessage('Profile and settings updated successfully!');
    } catch (err) {
      setError('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <FaCog />;
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

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-section">
          <div className="loading-content">
            <FaSpinner className="loading-spinner" />
            <h3>Loading Settings</h3>
            <p>Please wait while we fetch your profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`settings-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="settings-header">
          <div className="header-content">
            <div className="header-icon">
              <div className="icon-symbol">⚙️</div>
            </div>
            <div className="header-text">
              <h1 className="header-title">Account Settings</h1>
              <p className="header-subtitle">Manage your profile information and preferences</p>
            </div>
          </div>
          
          <div className="role-info">
            <div className="role-badge" style={{ backgroundColor: getRoleColor(role) }}>
              {getRoleIcon(role)}
              <span>{role}</span>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="settings-form">
          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FaUser className="section-icon" />
                  Personal Information
                </h2>
                <p className="section-subtitle">Update your basic profile details</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FaUser className="label-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaEnvelope className="label-icon" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled
                  />
                  <small className="form-help">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaIdCard className="label-icon" />
                    User ID
                  </label>
                  <input
                    type="text"
                    name="userId"
                    value={profile.userId}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information Section (Students Only) */}
            {role === 'Student' && (
              <div className="form-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <FaGraduationCap className="section-icon" />
                    Academic Information
                  </h2>
                  <p className="section-subtitle">Update your academic details</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      <FaCalendar className="label-icon" />
                      Academic Year
                    </label>
                    <select
                      name="academicYear"
                      value={profile.academicYear}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Academic Year</option>
                      {settings.academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FaUserGraduate className="label-icon" />
                      Year Level
                    </label>
                    <select
                      name="year"
                      value={profile.year}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Year Level</option>
                      {settings.yearLevels.map(yearLevel => (
                        <option key={yearLevel} value={yearLevel}>{yearLevel}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FaUserTie className="label-icon" />
                      Section
                    </label>
                    <select
                      name="section"
                      value={profile.section}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Section</option>
                      {settings.sections.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FaBuilding className="label-icon" />
                      Department
                    </label>
                    <select
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Department</option>
                      {settings.departments.map(department => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="save-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="spinner-icon" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="button-icon" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
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

        {/* Error Message */}
        {error && (
          <div className="error-section">
            <div className="error-content">
              <FaExclamationTriangle className="error-icon" />
              <span className="error-text">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;