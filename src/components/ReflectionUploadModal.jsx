// frontend/src/components/ReflectionUploadModal.jsx

import React, { useState, useEffect } from 'react';
import { uploadReflection, getEvents } from '../api/api';
import './ReflectionUploadModal.css';

function ReflectionUploadModal({ show, onClose, eventId, onSuccess }) {
  const [reflection, setReflection] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingReflection, setExistingReflection] = useState('');
  const [existingAttachment, setExistingAttachment] = useState('');

  // Fetch existing reflection data when modal opens
  useEffect(() => {
    if (show && eventId) {
      const fetchExistingReflection = async () => {
        try {
          const events = await getEvents();
          const event = events.find(e => e._id === eventId);
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const att = event && event.attendance.find(a => 
            a.userId === user._id || (a.userId && a.userId._id === user._id)
          );
          
          if (att) {
            setExistingReflection(att.reflection || '');
            setExistingAttachment(att.attachment || '');
            setReflection(att.reflection || '');
          }
        } catch (err) {
          console.error('Error fetching existing reflection:', err);
        }
      };
      
      fetchExistingReflection();
    }
  }, [show, eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that either reflection text or file is provided
    if (!reflection.trim() && !file) {
      setError('Please provide either a reflection text or an attachment.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await uploadReflection(eventId, file, reflection);
      setSuccess(existingReflection ? 'Reflection/attachment updated successfully!' : 'Reflection/attachment uploaded successfully!');
      setReflection('');
      setFile(null);
      setExistingReflection('');
      setExistingAttachment('');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to upload. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB.');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setError(''); // Clear any previous errors
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Upload Reflection/Attachment</h3>
        
        {/* Show existing reflection info */}
        {existingReflection && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            border: '1px solid #dee2e6'
          }}>
            <strong>Current Reflection:</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>{existingReflection}</p>
            {existingAttachment && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                <strong>Current Attachment:</strong> {existingAttachment}
              </p>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Reflection Text (required if no attachment):</label>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              required={!file}
              rows={4}
              style={{ width: '100%' }}
              placeholder="Please provide your reflection on the event..."
            />
          </div>
          <div>
            <label>Attachment (required if no reflection text):</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp,.svg,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.mp3,.wav,.ogg,.aac,.flac,.zip,.rar,.7z,.tar,.gz,.xls,.xlsx,.csv,.ppt,.pptx,.html,.css,.js,.json,.xml,.py,.java,.cpp,.c,.php,.sql,.md,.log,.ini,.conf,.config"
            />
            <small style={{ color: '#666', display: 'block', marginTop: 4 }}>
              Supported formats: Documents (PDF, DOC, DOCX, TXT, RTF, ODT), 
              Images (JPG, PNG, GIF, BMP, TIFF, WEBP, SVG), 
              Videos (MP4, AVI, MOV, WMV, FLV, WEBM, MKV), 
              Audio (MP3, WAV, OGG, AAC, FLAC),
              Archives (ZIP, RAR, 7Z, TAR, GZ), 
              Spreadsheets (XLS, XLSX, CSV), 
              Presentations (PPT, PPTX),
              Code files (HTML, CSS, JS, JSON, XML, Python, Java, C++, PHP, SQL),
              Other (MD, LOG, INI). Max size: 50MB.
            </small>
          </div>
          {error && <div className="error-message" style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          {success && <div className="success-message" style={{ color: 'green', marginTop: 8 }}>{success}</div>}
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={loading} style={{ marginRight: 8 }}>
              {loading ? 'Uploading...' : (existingReflection ? 'Update' : 'Submit')}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-backdrop {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          background: #fff; padding: 24px; border-radius: 8px; min-width: 400px; max-width: 600px;
        }
      `}</style>
    </div>
  );
}

export default ReflectionUploadModal;