// frontend/src/components/CreateEventPage.jsx
// Modern Redesigned Create Event Page

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { createEvent, getPublicSettings } from '../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './CreateEventPage.css';

function CreateEventPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [hours, setHours] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [isForAllDepartments, setIsForAllDepartments] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [isPublicRegistrationEnabled, setIsPublicRegistrationEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const settings = await getPublicSettings();
      if (settings.departments) {
        setDepartments(settings.departments.filter(d => d.isActive).map(d => d.name));
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(maxParticipants) <= 0) {
      Swal.fire({ icon: 'error', title: 'Invalid Slots', text: 'Available slots must be greater than 0.' });
      return;
    }
    if (Number(hours) <= 0) {
      Swal.fire({ icon: 'error', title: 'Invalid Hours', text: 'Event hours must be greater than 0.' });
      return;
    }
    
    // Validate time
    if (startTime && endTime && startTime >= endTime) {
      Swal.fire({ icon: 'error', title: 'Invalid Time', text: 'End time must be after start time.' });
      return;
    }
    
    // Validate department selection
    if (!isForAllDepartments && selectedDepartments.length === 0) {
      Swal.fire({ icon: 'error', title: 'Department Required', text: 'Please select at least one department or mark the event as available for all departments.' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date);
      formData.append('startTime', startTime);
      formData.append('endTime', endTime);
      formData.append('location', location);
      formData.append('maxParticipants', maxParticipants);
      formData.append('hours', hours);
      formData.append('isForAllDepartments', isForAllDepartments);
      formData.append('requiresApproval', requiresApproval);
      formData.append('isPublicRegistrationEnabled', isPublicRegistrationEnabled);
      
      if (image) formData.append('image', image);
      
      // Handle department selection
      if (isForAllDepartments) {
        formData.append('departments', JSON.stringify([])); // Empty array for all departments
      } else {
        formData.append('departments', JSON.stringify(selectedDepartments));
      }

      await createEvent(formData);
      setLoading(false);
      Swal.fire({ icon: 'success', title: 'Event Created', text: 'The event has been created successfully!' });
      navigate('/admin/manage-events');
    } catch (err) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to create event. Please try again.'
      });
    }
  };

  const handleAllDepartmentsChange = (checked) => {
    setIsForAllDepartments(checked);
    if (checked) {
      setSelectedDepartments([]);
    }
  };

  const handleDepartmentChange = (dept) => {
    setSelectedDepartments(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Swal.fire({ icon: 'error', title: 'File Too Large', text: 'Please select an image smaller than 5MB.' });
        return;
      }
      setImage(file);
    }
  };

  return (
    <div className="create-event-page">
      <div className="page-background">
        <div className="background-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <Container className={`create-event-container ${isVisible ? 'visible' : ''}`}>
        <div className="page-header">
          <div className="header-icon">
            <div className="icon-symbol">🎉</div>
          </div>
          <div className="header-content">
            <h1 className="page-title">Create New Event</h1>
            <p className="page-subtitle">Design an amazing event that your community will love</p>
          </div>
        </div>

        <Form onSubmit={handleSubmit} className="event-form">
          {/* Event Details Card */}
          <div className="form-card">
            <div className="card-header">
              <div className="card-icon">📝</div>
              <h3 className="card-title">Event Details</h3>
              <p className="card-subtitle">Basic information about your event</p>
            </div>
            
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <Form.Control
                  type="text"
                  placeholder="Enter a catchy event title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="form-input"
                />
                <div className="input-hint">Make it engaging and descriptive</div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Describe what attendees can expect..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="form-input textarea-input"
                />
                <div className="input-hint">Provide details about activities, benefits, and requirements</div>
              </div>
            </div>
          </div>

          {/* Date & Time Card */}
          <div className="form-card">
            <div className="card-header">
              <div className="card-icon">🕒</div>
              <h3 className="card-title">Date & Time</h3>
              <p className="card-subtitle">When will your event take place?</p>
            </div>
            
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Date *</label>
                  <Form.Control
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <Form.Control
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    className="form-input"
                    step="900"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <Form.Control
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                    className="form-input"
                    step="900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Capacity Card */}
          <div className="form-card">
            <div className="card-header">
              <div className="card-icon">📍</div>
              <h3 className="card-title">Location & Capacity</h3>
              <p className="card-subtitle">Where and how many can attend?</p>
            </div>
            
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Event Location *</label>
                <Form.Control
                  type="text"
                  placeholder="Enter the event location..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  className="form-input"
                />
                <div className="input-hint">Physical location or virtual meeting link</div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Available Slots *</label>
                  <Form.Control
                    type="number"
                    placeholder="Enter number of slots"
                    value={maxParticipants}
                    onChange={e => setMaxParticipants(e.target.value)}
                    required
                    min="1"
                    className="form-input"
                  />
                  <div className="input-hint">Maximum number of participants</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Hours *</label>
                  <Form.Control
                    type="number"
                    placeholder="Enter service hours"
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    required
                    min="1"
                    step="0.5"
                    className="form-input"
                  />
                  <div className="input-hint">Hours of community service</div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Access Card */}
          <div className="form-card">
            <div className="card-header">
              <div className="card-icon">🏢</div>
              <h3 className="card-title">Department Access</h3>
              <p className="card-subtitle">Who can participate in this event?</p>
            </div>
            
            <div className="card-body">
              <div className="form-group">
                <div className="checkbox-group">
                  <Form.Check
                    type="checkbox"
                    id="allDepartments"
                    label="Available for all departments"
                    checked={isForAllDepartments}
                    onChange={(e) => handleAllDepartmentsChange(e.target.checked)}
                    className="form-checkbox"
                  />
                  <div className="checkbox-hint">Open to students from any department</div>
                </div>
              </div>

              {!isForAllDepartments && (
                <div className="form-group">
                  <label className="form-label">Select Specific Departments</label>
                  <div className="departments-grid">
                    {departments.map(dept => (
                      <div key={dept} className="department-item">
                        <Form.Check
                          type="checkbox"
                          id={`dept-${dept}`}
                          label={dept}
                          checked={selectedDepartments.includes(dept)}
                          onChange={() => handleDepartmentChange(dept)}
                          className="department-checkbox"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="input-hint">Choose which departments can participate</div>
                </div>
              )}
            </div>
          </div>

          {/* Registration Settings Card */}
          <div className="form-card">
            <div className="card-header">
              <div className="card-icon">⚙️</div>
              <h3 className="card-title">Registration Settings</h3>
              <p className="card-subtitle">Configure how students can register</p>
            </div>
            
            <div className="card-body">
              <div className="form-group">
                <div className="checkbox-group">
                  <Form.Check
                    type="checkbox"
                    id="requiresApproval"
                    label="Require staff/admin approval"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    className="form-checkbox"
                  />
                  <div className="checkbox-hint">Students must wait for approval before time in/out</div>
                </div>
              </div>

              <div className="form-group">
                <div className="checkbox-group">
                  <Form.Check
                    type="checkbox"
                    id="isPublicRegistrationEnabled"
                    label="Enable public registration"
                    checked={isPublicRegistrationEnabled}
                    onChange={(e) => setIsPublicRegistrationEnabled(e.target.checked)}
                    className="form-checkbox"
                  />
                  <div className="checkbox-hint">Anyone with the link can view and register</div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Image Card */}
          <div className="form-card">
            <div className="card-header">
              <div className="card-icon">🖼️</div>
              <h3 className="card-title">Event Image</h3>
              <p className="card-subtitle">Add a visual to make your event stand out</p>
            </div>
            
            <div className="card-body">
              <div className="form-group">
                <div className="image-upload-area">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                    id="event-image"
                  />
                  <div className="upload-content">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">
                      <span className="upload-title">Choose Event Image</span>
                      <span className="upload-subtitle">Click to browse or drag and drop</span>
                    </div>
                  </div>
                </div>
                
                {image && (
                  <div className="image-preview">
                    <div className="preview-frame">
                      <img src={URL.createObjectURL(image)} alt="Event preview" />
                      <div className="preview-overlay">
                        <span className="preview-text">Preview</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="upload-info">
                  <div className="info-item">
                    <span className="info-label">Formats:</span>
                    <span className="info-value">JPG, PNG, GIF, WEBP</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Size:</span>
                    <span className="info-value">1280x720 (16:9 ratio)</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Max:</span>
                    <span className="info-value">5MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => navigate('/admin/manage-events')}
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating Event...
                </>
              ) : (
                <>
                  <span className="button-icon">✨</span>
                  Create Event
                </>
              )}
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
}

export default CreateEventPage;