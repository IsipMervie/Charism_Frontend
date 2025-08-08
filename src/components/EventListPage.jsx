// frontend/src/components/EventListPage.jsx
// Simple but Creative Event List Page Design

import React, { useState, useEffect } from 'react';
import { getEvents, joinEvent, timeIn, timeOut, getPublicSettings } from '../api/api';
import Swal from 'sweetalert2';
import ReflectionUploadModal from './ReflectionUploadModal';
import { FaSearch, FaCalendar, FaClock, FaUsers, FaMapMarkerAlt, FaSpinner, FaExclamationTriangle, FaFilter, FaEye, FaDownload } from 'react-icons/fa';
import './EventListPage.css';

function EventListPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionEventId, setReflectionEventId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const role = localStorage.getItem('role');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // PDF Filter options
  const [pdfFilters, setPdfFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    location: '',
    department: ''
  });
  
  // Available options for filters
  const [filterOptions, setFilterOptions] = useState({
    departments: []
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Helper to determine event status
  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate < now && event.attendance && event.attendance.some(a => a.timeOut)) {
      return 'completed';
    } else if (eventDate < now) {
      return 'past';
    } else if (eventDate.toDateString() === now.toDateString()) {
      return 'today';
    } else {
      return 'upcoming';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'today': return 'status-today';
      case 'past': return 'status-past';
      case 'completed': return 'status-completed';
      default: return 'status-upcoming';
    }
  };

  // Refresh events and joined events
  const refreshEvents = async () => {
    setLoading(true);
    try {
      const [eventsData, settingsData] = await Promise.all([
        getEvents(),
        getPublicSettings()
      ]);
      
      setEvents(eventsData);
      
      // Set filter options
      setFilterOptions({
        departments: settingsData.departments?.filter(d => d.isActive).map(d => d.name) || []
      });
      
      if (role === 'Student' && user && user._id) {
        const joined = eventsData
          .filter(event =>
            event.attendance &&
            event.attendance.some(a => a.userId === user._id || (a.userId && a.userId._id === user._id))
          )
          .map(event => event._id);
        setJoinedEvents(joined);
      }
      setLoading(false);
    } catch (err) {
      setError('Could not load events.');
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setPdfFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    refreshEvents();
    // eslint-disable-next-line
  }, [role]);

  const handleJoin = async (eventId) => {
    const event = events.find(e => e._id === eventId);
    if (!event) return;

    const eventDate = new Date(event.date);
    const eventTime = event.time || '00:00';
    const eventDateTime = new Date(`${eventDate.toDateString()} ${eventTime}`);
    const now = new Date();

    const result = await Swal.fire({
      title: 'Confirm Registration',
      html: `
        <div style="text-align: left;">
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${eventDate.toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${event.time || 'TBD'}</p>
          <p><strong>Location:</strong> ${event.location || 'TBD'}</p>
          <p><strong>Service Hours:</strong> ${event.hours} hours</p>
          <br>
          <div style="background-color: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;"><strong>Important Reminders:</strong></p>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; color: #856404;">
              <li>Don't time in if the event hasn't started yet</li>
              <li>Make sure to time out when you leave</li>
              <li>Upload your reflection after completing the event</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Register',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      width: '500px'
    });

    if (!result.isConfirmed) return;

    try {
      await joinEvent(eventId);
      await refreshEvents();
      Swal.fire({ 
        icon: 'success', 
        title: 'Registration Successful!', 
        text: 'You have successfully registered for the event. Please remember to time in when the event starts and time out when you leave.' 
      });

      // Preserve the scroll position after the event is added
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Registration Failed', 
        text: 'Failed to register for event. Please try again.' 
      });
    }
  };

  const handleTimeIn = async (eventId) => {
    const event = events.find(e => e._id === eventId);
    if (!event) return;

    const eventDate = new Date(event.date);
    const eventTime = event.time || '00:00';
    const eventDateTime = new Date(`${eventDate.toDateString()} ${eventTime}`);
    const now = new Date();

    // Check if event has started
    if (eventDateTime > now) {
      Swal.fire({
        icon: 'warning',
        title: 'Event Not Started',
        text: 'This event has not started yet. Please wait until the event begins before timing in.',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Time In',
      text: 'Do you want to record your Time In for this event?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Time In',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    });
    if (!result.isConfirmed) return;

    try {
      await timeIn(eventId);
      await refreshEvents();
      Swal.fire({ 
        icon: 'success', 
        title: 'Time In Recorded!', 
        text: 'Your time in has been successfully recorded.' 
      });

      // Preserve the scroll position after the event is added
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Time In error:', err);
      Swal.fire({ 
        icon: 'error', 
        title: 'Time In Failed', 
        text: err.message || 'Failed to record Time In. Please try again.' 
      });
    }
  };

  const handleTimeOut = async (eventId) => {
    const result = await Swal.fire({
      title: 'Confirm Time Out',
      text: 'Do you want to record your Time Out for this event?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Time Out',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });
    if (!result.isConfirmed) return;

    try {
      await timeOut(eventId);
      await refreshEvents();
      Swal.fire({ 
        icon: 'success', 
        title: 'Time Out Recorded!', 
        text: 'Your time out has been successfully recorded.' 
      });

      // Preserve the scroll position after the event is added
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Time Out error:', err);
      Swal.fire({ 
        icon: 'error', 
        title: 'Time Out Failed', 
        text: err.message || 'Failed to record Time Out. Please try again.' 
      });
    }
  };

  // PDF Download Handler (Admin/Staff only)
  const handleDownloadPDF = async () => {
    try {
      // Build query parameters for PDF generation
      const params = new URLSearchParams();
      
      if (pdfFilters.status) params.append('status', pdfFilters.status);
      if (pdfFilters.dateFrom) params.append('dateFrom', pdfFilters.dateFrom);
      if (pdfFilters.dateTo) params.append('dateTo', pdfFilters.dateTo);
      if (pdfFilters.location) params.append('location', pdfFilters.location);
      if (pdfFilters.department) params.append('department', pdfFilters.department);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/event-list?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event-list.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: `Could not download PDF: ${err.message}`
      });
    }
  };

  // Filter events by status and search
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(search.toLowerCase()));
    const status = getEventStatus(event);
    return (filter === 'all' || filter === status) && matchesSearch;
  });

  // Open modal for reflection/attachment upload
  const handleUploadReflection = (eventId) => {
    const event = events.find(e => e._id === eventId);
    const att = event && event.attendance.find(a => (a.userId === user._id || (a.userId && a.userId._id === user._id)));

    // Allow re-uploading - show warning if already uploaded
    if (att && (att.reflection || att.attachment)) {
      Swal.fire({
        icon: 'warning',
        title: 'Update Reflection',
        text: 'You have already uploaded a reflection for this event. This will replace your previous submission.',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          setReflectionEventId(eventId);
          setShowReflectionModal(true);
        }
      });
      return;
    }

    setReflectionEventId(eventId);
    setShowReflectionModal(true);
  };

  const handleReflectionSuccess = () => {
    setShowReflectionModal(false);
    setReflectionEventId(null);
    refreshEvents();
    Swal.fire({ 
      icon: 'success', 
      title: 'Upload Successful!', 
      text: 'Your reflection/attachment has been uploaded successfully.' 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="event-list-page">
        <div className="loading-section">
          <FaSpinner className="loading-spinner" />
          <h3>Loading Events...</h3>
          <p>Please wait while we fetch the latest events</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="event-list-page">
        <div className="error-section">
          <FaExclamationTriangle className="error-icon" />
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={refreshEvents}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-list-page">
      <div className="event-list-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`event-list-container ${isVisible ? 'visible' : ''}`}>
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-icon">
              <div className="icon-symbol">📅</div>
            </div>
            <h1 className="hero-title">Community Events</h1>
            <p className="hero-subtitle">Discover meaningful opportunities to serve your community and make a difference</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events by title, description, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-box">
            <FaFilter className="filter-icon" />
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="past">Past</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Download PDF Button for Admin/Staff */}
        {(role === 'Admin' || role === 'Staff') && (
          <div className="pdf-download-section">
            <button
              className="pdf-download-button"
              onClick={handleDownloadPDF}
            >
              <FaDownload className="download-icon" />
              Download Event List PDF
            </button>
          </div>
        )}
        
        {/* PDF Filter Options for Admin/Staff */}
        {(role === 'Admin' || role === 'Staff') && (
          <div className="pdf-filters-section">
            <h4 className="filters-title">PDF Filter Options</h4>
            <div className="filters-grid">
              <div className="filter-field">
                <label>Status:</label>
                <select
                  value={pdfFilters.status}
                  onChange={e => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="today">Today</option>
                  <option value="past">Past</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="filter-field">
                <label>Date From:</label>
                <input
                  type="date"
                  value={pdfFilters.dateFrom}
                  onChange={e => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label>Date To:</label>
                <input
                  type="date"
                  value={pdfFilters.dateTo}
                  onChange={e => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label>Location:</label>
                <input
                  type="text"
                  placeholder="Enter location..."
                  value={pdfFilters.location}
                  onChange={e => handleFilterChange('location', e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label>Department:</label>
                <select
                  value={pdfFilters.department}
                  onChange={e => handleFilterChange('department', e.target.value)}
                >
                  <option value="">All Departments</option>
                  {filterOptions.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="events-section">
          {filteredEvents.length === 0 ? (
            <div className="no-events">
              <div className="no-events-icon">📅</div>
              <h3>No Events Found</h3>
              <p>No events match your current search criteria.</p>
              <p>Try adjusting your search or filter options.</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map(event => {
                const att = event.attendance?.find(a => (a.userId === user._id || (a.userId && a.userId._id === user._id)));
                const status = getEventStatus(event);
                const isJoined = joinedEvents.includes(event._id);

                // Calculate available slots and status
                const maxParticipants = typeof event.maxParticipants === 'number' ? event.maxParticipants : 0;
                const attendanceCount = Array.isArray(event.attendance) ? event.attendance.length : 0;
                const availableSlots = maxParticipants > 0 ? maxParticipants - attendanceCount : 0;
                const isAvailable = event.status === 'Active' && availableSlots > 0;

                return (
                  <div key={event._id} className="event-card">
                    {/* Event Image */}
                    {event.image && (
                      <div className="event-image-wrapper">
                        <img
                          src={`http://localhost:5000/uploads/${event.image}`}
                          alt={event.title}
                          className="event-image"
                        />
                        <div className="event-status">
                          <span className={`status-badge ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Event Content */}
                    <div className="event-content">
                      <h3 className="event-title">{event.title}</h3>
                      
                      <div className="event-meta">
                        <div className="meta-item">
                          <FaCalendar className="meta-icon" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                          <FaClock className="meta-icon" />
                          <span>{event.time || 'TBD'}</span>
                        </div>
                        <div className="meta-item">
                          <FaMapMarkerAlt className="meta-icon" />
                          <span>{event.location || 'TBD'}</span>
                        </div>
                        <div className="meta-item">
                          <FaUsers className="meta-icon" />
                          <span>
                            {availableSlots > 0 ? `${availableSlots} slots` : 'No slots available'}
                          </span>
                        </div>
                      </div>

                      <p className="event-description">{event.description}</p>
                      
                      <div className="event-hours">
                        <strong>Service Hours: {event.hours} hours</strong>
                      </div>

                      {/* Event Actions */}
                      <div className="event-actions">
                        {role === 'Student' && !isJoined && isAvailable && (
                          <button 
                            className="action-button primary-button"
                            onClick={() => handleJoin(event._id)}
                          >
                            Register for Event
                          </button>
                        )}
                        
                        {role === 'Student' && isJoined && (
                          <div className="student-actions">
                            <div className="time-buttons">
                              <button 
                                className={`action-button ${att && att.timeIn ? 'success-button disabled' : 'warning-button'}`}
                                onClick={() => handleTimeIn(event._id)} 
                                disabled={att && att.timeIn}
                              >
                                {att && att.timeIn ? '✓ Time In Recorded' : 'Time In'}
                              </button>
                              
                              <button 
                                className={`action-button ${att && att.timeOut ? 'success-button disabled' : 'info-button'}`}
                                onClick={() => handleTimeOut(event._id)} 
                                disabled={att && !att.timeIn || (att && att.timeOut)}
                              >
                                {att && att.timeOut ? '✓ Time Out Recorded' : 'Time Out'}
                              </button>
                            </div>

                            {/* Time Display */}
                            {(att && (att.timeIn || att.timeOut)) && (
                              <div className="time-display">
                                {att.timeIn && (
                                  <div className="time-item">
                                    <span className="time-label">Time In:</span>
                                    <span className="time-value">
                                      {new Date(att.timeIn).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {att.timeOut && (
                                  <div className="time-item">
                                    <span className="time-label">Time Out:</span>
                                    <span className="time-value">
                                      {new Date(att.timeOut).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Reflection Upload */}
                            {att && att.timeOut && (
                              <button 
                                className="action-button primary-button reflection-button"
                                onClick={() => handleUploadReflection(event._id)}
                              >
                                {att.reflection || att.attachment ? 'Update Reflection/Attachment' : 'Upload Reflection/Attachment'}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {(role === 'Admin' || role === 'Staff') && (
                          <button 
                            className="action-button info-button"
                            onClick={() => window.location.href = `/events/${event._id}`}
                          >
                            <FaEye /> View Participants
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reflection Upload Modal */}
      <ReflectionUploadModal
        show={showReflectionModal}
        onClose={() => { setShowReflectionModal(false); setReflectionEventId(null); }}
        eventId={reflectionEventId}
        onSuccess={handleReflectionSuccess}
      />
    </div>
  );
}

export default EventListPage;
