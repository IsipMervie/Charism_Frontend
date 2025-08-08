import React, { useEffect, useState } from 'react';
import { getEventDetails, updateEvent } from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaSave, FaTimes, FaImage } from 'react-icons/fa';
import './EditEventPage.css';

function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    hours: '',
    image: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const data = await getEventDetails(eventId);
        setEvent(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          date: data.date ? data.date.slice(0, 10) : '',
          time: data.time || '',
          location: data.location || '',
          maxParticipants: data.maxParticipants || '',
          hours: data.hours || '',
          image: null
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch event details.');
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.maxParticipants) <= 0) {
      Swal.fire({ icon: 'error', title: 'Invalid Slots', text: 'Available slots must be greater than 0.' });
      return;
    }
    if (Number(form.hours) <= 0) {
      Swal.fire({ icon: 'error', title: 'Invalid Hours', text: 'Event hours must be greater than 0.' });
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', form.date);
      formData.append('time', form.time);
      formData.append('location', form.location);
      formData.append('maxParticipants', form.maxParticipants);
      formData.append('hours', form.hours);
      if (form.image) formData.append('image', form.image);

      await updateEvent(eventId, formData);
      Swal.fire({ icon: 'success', title: 'Event Updated!', text: 'The event has been successfully updated.' });
      navigate('/admin/manage-events');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: err?.response?.data?.message || 'Failed to update event. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Discard Changes?',
      text: 'Are you sure you want to discard your changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Discard',
      cancelButtonText: 'Keep Editing',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) navigate('/admin/manage-events');
    });
  };

  if (loading) {
    return (
      <div className="edit-event-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <h3>Loading Event...</h3>
          <p>Please wait while we fetch the event details</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-event-container">
        <div className="error-section">
          <h3>Error Loading Event</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-event-container">
      <div className="edit-event-content">
        <div className="edit-event-header">
          <h2>Edit Event</h2>
          <p>Update the event information below</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-event-form">
          <div className="form-group">
            <label htmlFor="title"><FaCalendar /> Event Title</label>
            <input type="text" id="title" name="title" value={form.title} onChange={handleChange} required placeholder="Enter event title" />
          </div>

          <div className="form-group">
            <label htmlFor="description"><FaMapMarkerAlt /> Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} required placeholder="Enter event description" rows="4" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date"><FaCalendar /> Date</label>
              <input type="date" id="date" name="date" value={form.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="time"><FaClock /> Time</label>
              <input type="time" id="time" name="time" value={form.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location"><FaMapMarkerAlt /> Location</label>
            <input type="text" id="location" name="location" value={form.location} onChange={handleChange} required placeholder="Enter event location" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxParticipants"><FaUsers /> Available Slots</label>
              <input type="number" id="maxParticipants" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} required min="1" placeholder="Enter number of slots" />
            </div>

            <div className="form-group">
              <label htmlFor="hours"><FaClock /> Event Hours</label>
              <input type="number" id="hours" name="hours" value={form.hours} onChange={handleChange} required min="1" step="0.5" placeholder="Enter service hours" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image"><FaImage /> Event Image (optional)</label>
            <input type="file" id="image" name="image" onChange={handleImageChange} accept="image/*" />
            <div className="form-text">Recommended aspect ratio 16:9 (e.g., 1280x720). Supported formats: JPG, PNG.</div>
            {event?.image && !form.image && (
              <div className="current-image image-preview">
                <p>Current Image:</p>
                <div className="image-frame">
                  <img src={`http://localhost:5000/uploads/${event.image}`} alt="Current event" />
                </div>
              </div>
            )}
            {form.image && (
              <div className="new-image image-preview">
                <p>New Image Selected:</p>
                <div className="image-frame">
                  <img src={URL.createObjectURL(form.image)} alt="New event" />
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : (<><FaSave /> Save Changes</>)}
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEventPage;
