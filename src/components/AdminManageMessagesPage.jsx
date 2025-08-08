// frontend/src/components/AdminManageMessagesPage.jsx
// Simple but Creative Manage Messages Page Design

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaSearch, FaEnvelope, FaEnvelopeOpen, FaUser, FaCalendar, FaTrash, FaCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import './AdminManageMessagesPage.css';

function AdminManageMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fetchMessages = async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `/api/contact-us${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {
      setError('Failed to load messages. Please try again.');
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMessages(search);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/contact-us/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ 
        icon: 'success', 
        title: 'Message Marked as Read',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchMessages(search);
    } catch {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Failed to mark as read.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/contact-us/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Message has been deleted.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        fetchMessages(search);
      } catch {
        Swal.fire({ 
          icon: 'error', 
          title: 'Error', 
          text: 'Failed to delete message.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    }
  };

  const getMessageStatus = (message) => {
    return message.read ? 'read' : 'unread';
  };

  const getStatusColor = (status) => {
    return status === 'unread' ? 'unread' : 'read';
  };

  if (loading) {
    return (
      <div className="manage-messages-page">
        <div className="loading-section">
          <FaSpinner className="loading-spinner" />
          <h3>Loading Messages</h3>
          <p>Please wait while we fetch your messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-messages-page">
        <div className="error-section">
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <Button className="retry-button" onClick={() => fetchMessages()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-messages-page">
      <div className="manage-messages-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`manage-messages-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <div className="icon-symbol">💬</div>
            </div>
            <div className="header-text">
              <h1 className="header-title">Contact Messages</h1>
              <p className="header-subtitle">Manage and respond to messages from your community</p>
            </div>
          </div>
          <div className="message-stats">
            <div className="stat-item">
              <span className="stat-number">{messages.length}</span>
              <span className="stat-label">Total Messages</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{messages.filter(m => !m.read).length}</span>
              <span className="stat-label">Unread</span>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <Form onSubmit={handleSearch} className="search-box">
            <Form.Control
              type="text"
              placeholder="Search by name, email, or message content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            <div className="search-buttons">
              <Button type="submit" className="search-button">
                Search
              </Button>
              <Button
                variant="outline-secondary"
                className="clear-button"
                onClick={() => { setSearch(''); fetchMessages(''); }}
              >
                Clear
              </Button>
            </div>
          </Form>
        </div>

        {/* Messages Section */}
        <div className="messages-section">
          {messages.length === 0 ? (
            <div className="no-messages">
              <FaEnvelope className="no-messages-icon" />
              <h3>No Messages Found</h3>
              <p>{search ? 'Try adjusting your search terms' : 'You\'re all caught up! No messages to display.'}</p>
            </div>
          ) : (
            <div className="messages-grid">
              {messages.map(message => (
                <div key={message._id} className={`message-card ${getMessageStatus(message)}`}>
                  <div className="message-header">
                    <div className="message-status">
                      <span className={`status-badge ${getStatusColor(getMessageStatus(message))}`}>
                        {message.read ? <FaEnvelopeOpen className="status-icon" /> : <FaEnvelope className="status-icon" />}
                        <span className="status-text">{message.read ? 'Read' : 'Unread'}</span>
                      </span>
                    </div>
                    <div className="message-date">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="message-content">
                    <div className="message-sender">
                      <FaUser className="sender-icon" />
                      <div className="sender-info">
                        <h4 className="sender-name">{message.name}</h4>
                        <p className="sender-email">{message.email}</p>
                      </div>
                    </div>

                    <div className="message-body">
                      <p className="message-text">{message.message}</p>
                    </div>

                    <div className="message-meta">
                      <div className="meta-item">
                        <FaCalendar className="meta-icon" />
                        <span className="meta-text">{new Date(message.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="message-actions">
                    {!message.read && (
                      <Button
                        className="action-button mark-read-button"
                        onClick={() => handleMarkAsRead(message._id)}
                      >
                        <FaCheck className="button-icon" />
                        <span>Mark as Read</span>
                      </Button>
                    )}
                    <Button
                      className="action-button delete-button"
                      onClick={() => handleDelete(message._id)}
                    >
                      <FaTrash className="button-icon" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminManageMessagesPage;