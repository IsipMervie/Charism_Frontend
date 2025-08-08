// frontend/src/components/CreateEventPage.jsx
// Simple but Creative Create Event Page Design

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { createEvent } from '../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './CreateEventPage.css';

function CreateEventPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [hours, setHours] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date);
      formData.append('time', time);
      formData.append('location', location);
      formData.append('maxParticipants', maxParticipants);
      formData.append('hours', hours);
      if (image) formData.append('image', image);

      await createEvent(formData);
      setLoading(false);
      Swal.fire({ icon: 'success', title: 'Event Created', text: 'The event has been created successfully!' });
      navigate('/admin/manage-events');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || 'Error creating event. Please try again.',
      });
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImage(file);
    } else {
      setImage(null);
    }
  };

  return (
    <div className="create-event-page">
      <div className="create-event-background">
        <div className="background-pattern"></div>
      </div>

      <Container className={`create-event-container ${isVisible ? 'visible' : ''}`}>
        <div className="create-event-card">
          {/* Header */}
          <div className="create-event-header">
            <div className="create-event-icon">
              <div className="icon-symbol">🎉</div>
            </div>
            <h1 className="create-event-title">Create New Event</h1>
            <p className="create-event-subtitle">Fill out the details below to publish a new event</p>
          </div>

          {/* Form */}
          <Form onSubmit={handleSubmit} className="create-event-form">
            <div className="form-section">
              <h3 className="section-title">Event Details</h3>
              
              <div className="form-field">
                <div className="input-wrapper">
                  <Form.Control
                    type="text"
                    placeholder="Enter event title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="form-input"
                  />
                  <div className="input-focus-line"></div>
                </div>
                <div className="form-hint">Choose a catchy and descriptive title for your event</div>
              </div>

              <div className="form-field">
                <div className="input-wrapper">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Describe the event"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="form-input textarea-input"
                  />
                  <div className="input-focus-line"></div>
                </div>
                <div className="form-hint">Provide a detailed description of what attendees can expect</div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Date & Time</h3>
              
              <div className="form-row">
                <div className="form-field">
                  <div className="input-wrapper">
                    <Form.Control
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                      className="form-input"
                    />
                    <div className="input-focus-line"></div>
                  </div>
                  <div className="form-hint">Select the event date</div>
                </div>

                <div className="form-field">
                  <div className="input-wrapper">
                    <Form.Control
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      required
                      className="form-input"
                    />
                    <div className="input-focus-line"></div>
                  </div>
                  <div className="form-hint">Select the event time</div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Location & Capacity</h3>
              
              <div className="form-field">
                <div className="input-wrapper">
                  <Form.Control
                    type="text"
                    placeholder="Enter event location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                    className="form-input"
                  />
                  <div className="input-focus-line"></div>
                </div>
                <div className="form-hint">Specify where the event will take place</div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <div className="input-wrapper">
                    <Form.Control
                      type="number"
                      placeholder="Available slots (e.g., 50)"
                      value={maxParticipants}
                      onChange={e => setMaxParticipants(e.target.value)}
                      required
                      min={1}
                      className="form-input"
                    />
                    <div className="input-focus-line"></div>
                  </div>
                  <div className="form-hint">Maximum number of participants</div>
                </div>

                <div className="form-field">
                  <div className="input-wrapper">
                    <Form.Control
                      type="number"
                      placeholder="Event hours (e.g., 3)"
                      value={hours}
                      onChange={e => setHours(e.target.value)}
                      required
                      min={1}
                      step="0.5"
                      className="form-input"
                    />
                    <div className="input-focus-line"></div>
                  </div>
                  <div className="form-hint">Duration of the event in hours</div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Event Image</h3>
              
              <div className="form-field">
                <div className="file-upload-wrapper">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <div className="upload-hint">Recommended aspect ratio 16:9 (e.g., 1280x720). Supported formats: JPG, PNG.</div>
                </div>
                
                {image && (
                  <div className="image-preview">
                    <div className="image-frame">
                      <img src={URL.createObjectURL(image)} alt="Selected preview" />
                    </div>
                    <div className="image-hint">Preview (scaled to 16:9). The image will be cropped to fit.</div>
                  </div>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className={`create-event-button ${loading ? 'loading' : ''}`}
            >
              <span className="button-content">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2"/>
                    Creating event...
                  </>
                ) : (
                  'Create Event'
                )}
              </span>
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default CreateEventPage;