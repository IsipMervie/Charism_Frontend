// frontend/src/components/AdminManageEventsPage.jsx
// Simple but Creative Manage Events Page Design

import React, { useEffect, useState } from 'react';
import { getEvents, deleteEvent } from '../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaSearch, FaCalendar, FaClock, FaUsers, FaMapMarkerAlt, FaEdit, FaEye, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';
import './AdminManageEventsPage.css';

function AdminManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view this page.');
        setLoading(false);
        return;
      }

      // Check user role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = user.role || localStorage.getItem('role');
      
      if (!role || (role !== 'Admin' && role !== 'Staff')) {
        setError(`Access denied. This page requires Admin or Staff role. Your current role is: ${role || 'Unknown'}`);
        setLoading(false);
        return;
      }

      const data = await getEvents();
      setEvents(data);
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 403) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role || localStorage.getItem('role');
        setError(`Access denied. This page requires Admin or Staff role. Your current role is: ${role || 'Unknown'}`);
      } else {
        setError('Failed to fetch events. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (eventId) => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleView = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleDelete = async (eventId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the event.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;

    try {
      await deleteEvent(eventId);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Event deleted.' });
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      if (err.response?.status === 401) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Your session has expired. Please log in again.' });
      } else if (err.response?.status === 403) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Access denied. This action requires Admin or Staff role.' });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete event.' });
      }
    }
  };

  // Helper function to determine event status
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

  // Filter events by search
  const filteredEvents = events.filter(event =>
    (event.title && event.title.toLowerCase().includes(search.toLowerCase())) ||
    (event.description && event.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="manage-events-page">
      <div className="loading-section">
        <FaSpinner className="loading-spinner" />
        <h3>Loading Events...</h3>
        <p>Please wait while we fetch the events data</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="manage-events-page">
      <div className="error-section">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchEvents} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="manage-events-page">
      <div className="manage-events-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`manage-events-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <div className="icon-symbol">🎯</div>
            </div>
            <div className="header-text">
              <h1 className="header-title">Manage Events</h1>
              <p className="header-subtitle">Create, edit, and manage community events</p>
            </div>
          </div>
          <button
            className="create-event-button"
            onClick={() => navigate('/admin/create-event')}
          >
            <FaPlus className="button-icon" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events by title or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="events-section">
          {filteredEvents.length === 0 ? (
            <div className="no-events">
              <div className="no-events-icon">📅</div>
              <h3>No Events Found</h3>
              <p>No events match your current search criteria.</p>
              <p>Try adjusting your search or create a new event.</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map(event => {
                const status = getEventStatus(event);
                const maxParticipants = typeof event.maxParticipants === 'number' ? event.maxParticipants : 0;
                const attendanceCount = Array.isArray(event.attendance) ? event.attendance.length : 0;
                const availableSlots = maxParticipants > 0 ? maxParticipants - attendanceCount : 0;

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
                          <span>{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="meta-item">
                          <FaClock className="meta-icon" />
                          <span>{event.time || 'N/A'}</span>
                        </div>
                        <div className="meta-item">
                          <FaMapMarkerAlt className="meta-icon" />
                          <span>{event.location || 'N/A'}</span>
                        </div>
                        <div className="meta-item">
                          <FaUsers className="meta-icon" />
                          <span>
                            {availableSlots > 0 ? `${availableSlots} slots available` : 'No slots available'}
                          </span>
                        </div>
                      </div>

                      <div className="event-details">
                        <div className="detail-item">
                          <span className="detail-label">Service Hours:</span>
                          <span className="detail-value">{event.hours || 0} hours</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Attendees:</span>
                          <span className="detail-value">{attendanceCount} / {maxParticipants || '∞'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="action-buttons">
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEdit(event._id)}
                          title="Edit Event"
                        >
                          <FaEdit className="button-icon" />
                          <span>Edit</span>
                        </button>
                        <button
                          className="action-button view-button"
                          onClick={() => handleView(event._id)}
                          title="View Details"
                        >
                          <FaEye className="button-icon" />
                          <span>View</span>
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDelete(event._id)}
                          title="Delete Event"
                        >
                          <FaTrash className="button-icon" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminManageEventsPage;