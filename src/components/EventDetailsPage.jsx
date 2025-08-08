// frontend/src/components/EventDetailsPage.jsx
// Simple but Creative Event Details Page Design

import React, { useState, useEffect } from 'react';
import { getEventDetails, approveAttendance, disapproveAttendance, downloadReflection } from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaDownload, FaEye, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import './EventDetailsPage.css';

function EventDetailsPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle approve attendance with confirmation
  const handleApprove = async (userId) => {
    // Find the participant in the event
    const participant = event?.attendance?.find(p => p.userId._id === userId || p.userId === userId);
    
    // Check if student has timed out
    if (!participant?.timeOut) {
      Swal.fire('Cannot Approve', 'Student has not timed out yet. Attendance can only be approved after time-out.', 'warning');
      return;
    }

    // Check if student has uploaded a reflection (either text or attachment)
    const hasReflection = participant?.reflection && participant.reflection.trim() !== '';
    const hasAttachment = participant?.attachment && participant.attachment.trim() !== '';
    
    if (!hasReflection && !hasAttachment) {
      Swal.fire('Cannot Approve', 'Student has not uploaded a reflection or attachment yet. Attendance can only be approved after reflection submission.', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to approve this attendance?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await approveAttendance(eventId, userId);
        Swal.fire('Success', 'Attendance approved!', 'success');
        // Refresh event details
        const updatedEvent = await getEventDetails(eventId);
        setEvent(updatedEvent);
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to approve attendance.', 'error');
      }
    }
  };

  // Handle disapprove attendance with feedback
  const handleDisapprove = async (userId) => {
    const { value: reason } = await Swal.fire({
      title: 'Reason for Disapproval',
      input: 'textarea',
      inputLabel: 'Please provide a reason for disapproval',
      inputPlaceholder: 'Enter your reason here...',
      inputAttributes: {
        'aria-label': 'Enter your reason'
      },
      showCancelButton: true,
      confirmButtonText: 'Submit'
    });

    if (reason) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to disapprove this attendance?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, disapprove it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        try {
          await disapproveAttendance(eventId, userId, reason); // Passing reason to the API
          Swal.fire('Success', 'Attendance disapproved!', 'success');
          // Refresh event details
          const updatedEvent = await getEventDetails(eventId);
          setEvent(updatedEvent);
        } catch (err) {
          Swal.fire('Error', 'Failed to disapprove attendance.', 'error');
        }
      }
    } else {
      Swal.fire('Error', 'Reason is required to disapprove attendance.', 'error');
    }
  };

  // Handle downloading reflection (Admin/Staff only)
  const handleDownloadReflection = async (userId) => {
    try {
      console.log('Downloading reflection for user:', userId);
      await downloadReflection(eventId, userId);
      Swal.fire('Success', 'Reflection downloaded successfully!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Could not download reflection. Please try again.'
      });
    }
  };

  // Handle PDF Download for attendance (Admin/Staff only)
  const handleDownloadAttendancePDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/event-attendance/${eventId}`, {
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
      a.download = `event-attendance-${eventId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: `Could not download attendance PDF: ${err.message}`
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const eventData = await getEventDetails(eventId);
        setEvent(eventData);
        setError('');
      } catch (err) {
        setError('Error fetching event details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error,
      }).then(() => navigate('/events'));
    }
  }, [error, navigate]);

  useEffect(() => {
    if (!loading && !error && event === null) {
      Swal.fire({
        icon: 'warning',
        title: 'No Event Found',
        text: 'The event you are looking for does not exist.',
      }).then(() => navigate('/events'));
    }
  }, [loading, error, event, navigate]);

  if (loading) return (
    <div className="event-details-page">
      <div className="loading-section">
        <div className="loading-spinner"></div>
        <h3>Loading Event Details...</h3>
        <p>Please wait while we fetch the event information</p>
      </div>
    </div>
  );
  
  if (error) return null;
  if (!event) return null;

  // Calculate available slots and isAvailable
  const maxParticipants = typeof event.maxParticipants === 'number' ? event.maxParticipants : 0;
  const attendanceCount = Array.isArray(event.attendance) ? event.attendance.length : 0;
  const availableSlots = maxParticipants > 0 ? maxParticipants - attendanceCount : 0;
  const isAvailable = event.status === 'Active' && availableSlots > 0;

  // Filter attended participants
  const attendedParticipants = event.attendance?.filter(a => 
    a.status === 'Approved' || a.status === 'Attended'
  ) || [];

  return (
    <div className="event-details-page">
      <div className="event-details-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`event-details-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="event-header">
          <div className="event-header-content">
            <div className="event-header-icon">
              <div className="icon-symbol">📋</div>
            </div>
            <div className="event-header-text">
              <h1 className="event-title">{event.title}</h1>
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
            </div>
          </div>
          
          {/* Download PDF Button for Admin/Staff */}
          {(role === 'Admin' || role === 'Staff') && (
            <div className="download-section">
              <button
                className="download-pdf-button"
                onClick={handleDownloadAttendancePDF}
              >
                <FaDownload className="button-icon" />
                <span>Download Attendance PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Event Image */}
        {event.image && (
          <div className="event-image-section">
            <img
              src={`http://localhost:5000/uploads/${event.image}`}
              alt={event.title}
              className="event-image"
            />
          </div>
        )}

        {/* Event Details */}
        <div className="event-details-section">
          <div className="event-description">
            <h3 className="section-title">Description</h3>
            <p className="description-text">{event.description}</p>
          </div>

          <div className="event-info-grid">
            <div className="info-card">
              <h4 className="card-title">Event Information</h4>
              <div className="info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Time:</span>
                <span className="info-value">{event.time || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location:</span>
                <span className="info-value">{event.location || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Service Hours:</span>
                <span className="info-value">{event.hours} hours</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div className="info-card">
              <h4 className="card-title">Participation</h4>
              <div className="info-item">
                <span className="info-label">Total Participants:</span>
                <span className="info-value">{attendanceCount}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Attended:</span>
                <span className="info-value">{attendedParticipants.length}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Available Slots:</span>
                <span className="info-value">{availableSlots > 0 ? availableSlots : 'None'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Max Participants:</span>
                <span className="info-value">{maxParticipants > 0 ? maxParticipants : 'Unlimited'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="participants-section">
          <div className="section-header">
            <h3 className="section-title">Participants ({attendanceCount})</h3>
          </div>

          {event.attendance && event.attendance.length > 0 ? (
            <div className="participants-table-container">
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    {(role === 'Admin' || role === 'Staff') && <th>Actions</th>}
                    {(role === 'Admin' || role === 'Staff') && <th>Reflection</th>}
                  </tr>
                </thead>
                <tbody>
                  {event.attendance.map(att => (
                    <tr key={att.userId?._id || att.userId} className={`status-${att.status?.toLowerCase()}`}>
                      <td>{att.userId?.name || 'Unknown'}</td>
                      <td>{att.userId?.email || 'N/A'}</td>
                      <td>{att.userId?.department || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${att.status?.toLowerCase()}`}>
                          {att.status || 'Pending'}
                        </span>
                        {att.reason && (
                          <div className="reason-text">
                            <small>Reason: {att.reason}</small>
                          </div>
                        )}
                      </td>
                      <td>{att.timeIn ? new Date(att.timeIn).toLocaleString() : '-'}</td>
                      <td>{att.timeOut ? new Date(att.timeOut).toLocaleString() : '-'}</td>
                      {(role === 'Admin' || role === 'Staff') ? (
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button approve-button"
                              onClick={() => handleApprove(att.userId?._id || att.userId)}
                              title={att.status === 'Approved' ? 'Already Approved' : 'Approve Attendance'}
                            >
                              <FaCheck className="button-icon" />
                            </button>
                            <button
                              className="action-button disapprove-button"
                              onClick={() => handleDisapprove(att.userId?._id || att.userId)}
                              title={att.status === 'Disapproved' ? 'Already Disapproved' : 'Disapprove Attendance'}
                            >
                              <FaTimes className="button-icon" />
                            </button>
                          </div>
                          {(att.status === 'Approved' || att.status === 'Disapproved') && (
                            <div className="status-indicator">
                              {att.status === 'Approved' && (
                                <span className="status-approved">✓ Approved</span>
                              )}
                              {att.status === 'Disapproved' && (
                                <span className="status-disapproved">✗ Disapproved</span>
                              )}
                            </div>
                          )}
                        </td>
                      ) : null}
                      {(role === 'Admin' || role === 'Staff') ? (
                        att.attachment ? (
                          <td>
                            <button 
                              className="download-reflection-button"
                              onClick={() => handleDownloadReflection(att.userId?._id || att.userId)}
                            >
                              <FaDownload className="button-icon" />
                              <span>Download Reflection</span>
                            </button>
                          </td>
                        ) : (
                          <td>
                            <span className="no-attachment">No attachment</span>
                          </td>
                        )
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-participants">
              <div className="no-participants-icon">👥</div>
              <h4>No Participants Yet</h4>
              <p>This event hasn't been joined by any students yet.</p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="back-section">
          <button 
            className="back-button"
            onClick={() => navigate('/events')}
          >
            <FaArrowLeft className="button-icon" />
            <span>Back to Events</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetailsPage;
