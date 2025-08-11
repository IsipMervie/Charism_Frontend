// frontend/src/components/ManageUsersPage.jsx
// Fresh Simple but Creative Manage Users Page Design

import React, { useEffect, useState } from 'react';
import { Container, Button, Form, Spinner, Alert, Modal, Row, Col, Card, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaSearch, FaUsers, FaEdit, FaTrash, FaFilter, FaSort, FaUser, FaEnvelope, FaIdCard, FaBuilding, FaGraduationCap, FaCalendar, FaBell, FaEye, FaCrown, FaUserTie, FaUserGraduate } from 'react-icons/fa';
import {
  getUsers, updateUser, deleteUser, getSettings
} from '../api/api';
import './ManageUsersPage.css';

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Client-side sorting & pagination
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Dynamic options from settings
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const data = await getUsers(params);
      setUsers(data);
    } catch (err) {
      setError('Error fetching users. Please try again later.');
    }
    setLoading(false);
  };

  // Fetch settings for dynamic options
  const fetchSettings = async () => {
    try {
      const settings = await getSettings();
      setDepartmentOptions(settings.departments?.filter(d => d.isActive).map(d => d.name) || []);
      setYearOptions(settings.yearLevels?.filter(y => y.isActive).map(y => y.name) || []);
      setAcademicYearOptions(settings.academicYears?.filter(a => a.isActive).map(a => a.name) || []);
      setSectionOptions(settings.sections?.filter(s => s.isActive).map(s => s.name) || []);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, [roleFilter]);

  // Search handler
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Filter handler
  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  // Search on enter or button
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Edit user
  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      userId: user.userId,
      role: user.role,
      academicYear: user.academicYear || '',
      year: user.year || '',
      section: user.section || '',
      department: user.department || '',
      approvalStatus: user.approvalStatus || 'pending',
    });
    setShowEditModal(true);
  };

  // Edit form change
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save edit
  const handleEditSave = async () => {
    try {
      await updateUser(editUser._id, editForm);
      setShowEditModal(false);
      setEditUser(null);
      fetchUsers();
      Swal.fire({ icon: 'success', title: 'User updated!' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update user.' });
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the user.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;

    try {
      await deleteUser(userId);
      fetchUsers();
      Swal.fire({ icon: 'success', title: 'User deleted!' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete user.' });
    }
  };

  // Sorting helpers
  const requestSort = (key) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const getSortIndicator = (key) => {
    if (sortBy !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  const sortedUsers = [...users].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const getValue = (obj, key) => {
      const value = obj[key];
      if (value === undefined || value === null) return '';
      return String(value).toLowerCase();
    };
    const va = getValue(a, sortBy);
    const vb = getValue(b, sortBy);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedUsers = sortedUsers.slice(startIdx, startIdx + pageSize);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <FaCrown />;
      case 'Staff': return <FaUserTie />;
      case 'Student': return <FaUserGraduate />;
      default: return <FaUser />;
    }
  };

  if (loading) {
    return (
      <div className="manage-users-page">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <h3>Loading Users</h3>
          <p>Please wait while we fetch the user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-users-page">
        <div className="error-section">
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <Button className="retry-button" onClick={() => fetchUsers()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users-page">
      <div className="manage-users-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`manage-users-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <div className="icon-symbol">👥</div>
            </div>
            <div className="header-text">
              <h1 className="header-title">User Management</h1>
              <p className="header-subtitle">Manage and organize user accounts in your community</p>
            </div>
          </div>
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{users.filter(u => u.role === 'Student').length}</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{users.filter(u => u.role === 'Staff').length}</span>
              <span className="stat-label">Staff</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{users.filter(u => u.role === 'Admin').length}</span>
              <span className="stat-label">Admins</span>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="search-filters-section">
          <Form onSubmit={handleSearchSubmit} className="search-filters-form">
            <div className="search-box">
              <Form.Control
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={handleSearch}
                className="search-input"
              />
              <Button type="submit" className="search-button">
                <FaSearch className="button-icon" />
                <span>Search</span>
              </Button>
            </div>
            <div className="filters-box">
              <Form.Select value={roleFilter} onChange={handleRoleFilter} className="filter-select">
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Student">Student</option>
              </Form.Select>
            </div>
          </Form>
        </div>

        {/* Toolbar Section */}
        <div className="toolbar-section">
          <div className="toolbar-info">
            <span className="user-count">{users.length} users found</span>
          </div>
          <div className="toolbar-controls">
            <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="name">Sort by: Name</option>
              <option value="email">Sort by: Email</option>
              <option value="role">Sort by: Role</option>
            </Form.Select>
            <Form.Select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className="sort-direction">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Form.Select>
            <Form.Select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="page-size">
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </Form.Select>
          </div>
        </div>

        {/* Users Grid */}
        <div className="users-section">
          {paginatedUsers.length === 0 ? (
            <div className="no-users">
              <div className="no-users-icon">👥</div>
              <h3>No Users Found</h3>
              <p>{search || roleFilter ? 'Try adjusting your search or filter criteria' : 'No users have been added yet.'}</p>
            </div>
          ) : (
            <div className="users-grid">
              {paginatedUsers.map(user => (
                <div key={user._id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-avatar">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="user-info">
                      <h3 className="user-name">{user.name}</h3>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <div className="user-role">
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="user-card-content">
                    <div className="user-details">
                      <div className="detail-item">
                        <FaIdCard className="detail-icon" />
                        <span className="detail-label">User ID:</span>
                        <span className="detail-value">{user.userId || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <FaBuilding className="detail-icon" />
                        <span className="detail-label">Department:</span>
                        <span className="detail-value">{user.department || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <FaGraduationCap className="detail-icon" />
                        <span className="detail-label">Section:</span>
                        <span className="detail-value">{user.section || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <span className="detail-label">Year:</span>
                        <span className="detail-value">{user.year || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <span className="detail-label">Academic Year:</span>
                        <span className="detail-value">{user.academicYear || '-'}</span>
                      </div>
                    </div>

                    {user.role === 'Staff' && (
                      <div className="approval-status">
                        <span className={`status-badge ${user.approvalStatus}`}>
                          {user.approvalStatus === 'approved' ? 'Approved' : user.approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="user-card-actions">
                    <Button className="action-button edit-button" onClick={() => handleEdit(user)}>
                      <FaEdit className="button-icon" />
                      <span>Edit</span>
                    </Button>
                    <Button className="action-button delete-button" onClick={() => handleDelete(user._id)}>
                      <FaTrash className="button-icon" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && paginatedUsers.length > 0 && (
          <div className="pagination-section">
            <div className="pagination-info">
              <span>Page {currentPage} of {totalPages}</span>
            </div>
            <div className="pagination-controls">
              <Button className="pagination-button" disabled={currentPage === 1} onClick={() => setPage(1)}>
                {'<<'}
              </Button>
              <Button className="pagination-button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                {'<'}
              </Button>
              <Button className="pagination-button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                {'>'}
              </Button>
              <Button className="pagination-button" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>
                {'>>'}
              </Button>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} className="edit-modal">
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editForm.name || ''}
                  onChange={handleEditFormChange}
                  required
                  className="form-input"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editForm.email || ''}
                  onChange={handleEditFormChange}
                  required
                  className="form-input"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="text"
                  name="userId"
                  value={editForm.userId || ''}
                  onChange={handleEditFormChange}
                  className="form-input"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={editForm.role || ''}
                  onChange={handleEditFormChange}
                  required
                  className="form-input"
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Student">Student</option>
                </Form.Select>
              </Form.Group>
              {(editForm.role === 'Staff' || editForm.role === 'Student') && (
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="department"
                    value={editForm.department || ''}
                    onChange={handleEditFormChange}
                    className="form-input"
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              {editForm.role === 'Student' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Academic Year</Form.Label>
                    <Form.Select
                      name="academicYear"
                      value={editForm.academicYear || ''}
                      onChange={handleEditFormChange}
                      className="form-input"
                    >
                      <option value="">Select Academic Year</option>
                      {academicYearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Year Level</Form.Label>
                    <Form.Select
                      name="year"
                      value={editForm.year || ''}
                      onChange={handleEditFormChange}
                      className="form-input"
                    >
                      <option value="">Select Year Level</option>
                      {yearOptions.map(yearOption => (
                        <option key={yearOption} value={yearOption}>{yearOption}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Section</Form.Label>
                    <Form.Select
                      name="section"
                      value={editForm.section || ''}
                      onChange={handleEditFormChange}
                      className="form-input"
                    >
                      <option value="">Select Section</option>
                      {sectionOptions.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </>
              )}
              {editForm.role === 'Staff' && (
                <Form.Group className="mb-3">
                  <Form.Label>Approval Status</Form.Label>
                  <Form.Select
                    name="approvalStatus"
                    value={editForm.approvalStatus || 'pending'}
                    onChange={handleEditFormChange}
                    className="form-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              )}

            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="cancel-button">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditSave} className="save-button">
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ManageUsersPage;