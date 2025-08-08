import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventParticipants, approveAttendance, disapproveAttendance, downloadReflection } from '../api/api';
import Swal from 'sweetalert2';
import { FaDownload, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import './EventParticipantsPage.css';

function EventParticipantsPage() {
  const { eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const data = await getEventParticipants(eventId);
        setParticipants(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        Swal.fire('Error', 'Could not load participants.', 'error');
      }
    };

    fetchParticipants();
  }, [eventId]);

  const handleApprove = async (userId) => {
    const participant = participants.find(p => p.userId._id === userId || p.userId === userId);
    
    // Check if student has timed out
    if (!participant.timeOut) {
      Swal.fire('Cannot Approve', 'Student has not timed out yet. Attendance can only be approved after time-out.', 'warning');
      return;
    }

    // Check if student has uploaded a reflection (either text or attachment)
    const hasReflection = participant.reflection && participant.reflection.trim() !== '';
    const hasAttachment = participant.attachment && participant.attachment.trim() !== '';
    
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
        // Refresh participants list
        const data = await getEventParticipants(eventId);
        setParticipants(data);
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to approve attendance.', 'error');
      }
    }
  };

  const handleDisapprove = async (userId) => {
    const participant = participants.find(p => p.userId._id === userId || p.userId === userId);
    
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
          await disapproveAttendance(eventId, userId, reason);
          Swal.fire('Success', 'Attendance disapproved!', 'success');
          // Refresh participants list
          const data = await getEventParticipants(eventId);
          setParticipants(data);
        } catch (err) {
          Swal.fire('Error', 'Failed to disapprove attendance.', 'error');
        }
      }
    } else {
      Swal.fire('Error', 'Reason is required to disapprove attendance.', 'error');
    }
  };

  const handleDownloadReflection = async (userId) => {
    const participant = participants.find(p => p.userId._id === userId || p.userId === userId);
    
    try {
      await downloadReflection(eventId, userId);
      Swal.fire('Success', 'Reflection downloaded successfully!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      Swal.fire('Error', 'Failed to download reflection. Please try again.', 'error');
    }
  };

  return (
    <div className="event-participants-container">
      <div className="event-participants-card">
        {loading ? <p>Loading...</p> : null}
        <h2>Participants</h2>
        <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Time In/Out</th>
            <th>Status</th>
            <th>Reflection</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(participant => (
            <tr key={participant.userId._id || participant.userId} className={`status-${participant.status?.toLowerCase()}`}>
              <td>{participant.userId.name}</td>
              <td>{participant.userId.email}</td>
              <td>{participant.userId.department}</td>
              <td>
                <div className="time-status">
                  <div className="time-in">
                    <strong>Time In:</strong> {participant.timeIn ? new Date(participant.timeIn).toLocaleString() : 'Not timed in'}
                  </div>
                  <div className="time-out">
                    <strong>Time Out:</strong> {participant.timeOut ? new Date(participant.timeOut).toLocaleString() : 'Not timed out'}
                  </div>
                </div>
              </td>
              <td>
                <span className={`status-badge ${participant.status?.toLowerCase()}`}>
                  {participant.status || 'Pending'}
                </span>
                {participant.reason && (
                  <div className="reason-text">
                    <small>Reason: {participant.reason}</small>
                  </div>
                )}
              </td>
              <td>
                <div className="reflection-status">
                  {(participant.reflection || participant.attachment) ? (
                    <span className="reflection-uploaded" title={
                      participant.attachment ? 
                        (participant.reflection ? 'Attachment and reflection text uploaded' : 'Attachment uploaded') :
                        'Reflection text uploaded'
                    }>
                      ✓ {participant.attachment ? 'Attachment' : 'Reflection'} uploaded
                    </span>
                  ) : (
                    <span className="reflection-missing">✗ No reflection/attachment</span>
                  )}
                  {(participant.attachment || participant.reflection) && (
                    <button 
                      className="download-reflection-btn"
                      onClick={() => handleDownloadReflection(participant.userId._id || participant.userId)}
                      title={participant.attachment ? "Download Attachment" : "Download Reflection Text"}
                    >
                      <FaDownload /> Download
                    </button>
                  )}
                </div>
              </td>
              <td>
                <div className="action-buttons">
                  {participant.status === 'Pending' && (
                    <>
                      <button 
                        className={`approve-btn ${!participant.timeOut || (!participant.reflection && !participant.attachment) ? 'disabled' : ''}`}
                        onClick={() => handleApprove(participant.userId._id || participant.userId)}
                        title={!participant.timeOut ? 'Cannot approve: Student has not timed out' : 
                               (!participant.reflection && !participant.attachment) ? 'Cannot approve: Student has not uploaded reflection or attachment' : 
                               'Approve Attendance'}
                        disabled={!participant.timeOut || (!participant.reflection && !participant.attachment)}
                      >
                        <FaCheck />
                      </button>
                      <button 
                        className="disapprove-btn"
                        onClick={() => handleDisapprove(participant.userId._id || participant.userId)}
                        title="Disapprove Attendance"
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                  {(participant.status === 'Approved' || participant.status === 'Disapproved') && (
                    <>
                      <button 
                        className={`approve-btn ${!participant.timeOut || (!participant.reflection && !participant.attachment) ? 'disabled' : ''}`}
                        onClick={() => handleApprove(participant.userId._id || participant.userId)}
                        title={!participant.timeOut ? 'Cannot approve: Student has not timed out' : 
                               (!participant.reflection && !participant.attachment) ? 'Cannot approve: Student has not uploaded reflection or attachment' : 
                               'Change to Approved'}
                        disabled={!participant.timeOut || (!participant.reflection && !participant.attachment)}
                      >
                        <FaCheck />
                      </button>
                      <button 
                        className="disapprove-btn"
                        onClick={() => handleDisapprove(participant.userId._id || participant.userId)}
                        title="Change to Disapproved"
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventParticipantsPage;