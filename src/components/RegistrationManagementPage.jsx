// frontend/src/components/RegistrationManagementPage.jsx
// Simple but Creative Registration Management Page Design

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { 
  FaCalendarAlt, FaGraduationCap, FaUsers, FaBuilding, 
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff,
  FaSpinner, FaExclamationTriangle, FaCheckCircle, FaTimesCircle,
  FaClock, FaCalendar, FaMapMarkerAlt, FaIdCard
} from 'react-icons/fa';
import {
  getSettings, getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  addSection, updateSection, deleteSection, addYearLevel, updateYearLevel, deleteYearLevel,
  addDepartment, updateDepartment, deleteDepartment, toggleAcademicYearStatus
} from '../api/api';
import './RegistrationManagementPage.css';

function RegistrationManagementPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('academic-years');

  // Academic Years Management
  const [academicYears, setAcademicYears] = useState([]);
  const [showAcademicYearModal, setShowAcademicYearModal] = useState(false);
  const [editingAcademicYear, setEditingAcademicYear] = useState(null);
  const [academicYearForm, setAcademicYearForm] = useState({
    year: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  // Sections Management
  const [sections, setSections] = useState([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({ name: '' });

  // Year Levels Management
  const [yearLevels, setYearLevels] = useState([]);
  const [showYearLevelModal, setShowYearLevelModal] = useState(false);
  const [editingYearLevel, setEditingYearLevel] = useState(null);
  const [yearLevelForm, setYearLevelForm] = useState({ name: '' });

  // Departments Management
  const [departments, setDepartments] = useState([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({ name: '' });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [settingsData, academicYearsData] = await Promise.all([
        getSettings(),
        getAcademicYears()
      ]);
      setAcademicYears(academicYearsData || []);
      setSections(settingsData.sections || []);
      setYearLevels(settingsData.yearLevels || []);
      setDepartments(settingsData.departments || []);
      setError('');
    } catch {
      setError('Failed to fetch registration settings.');
    }
    setLoading(false);
  };

  // Academic Years Management
  const handleAddAcademicYear = () => {
    setEditingAcademicYear(null);
    setAcademicYearForm({
      year: '',
      description: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setShowAcademicYearModal(true);
  };

  const handleEditAcademicYear = (academicYear) => {
    setEditingAcademicYear(academicYear);
    setAcademicYearForm({
      year: academicYear.year || academicYear.name,
      description: academicYear.description || '',
      startDate: academicYear.startDate ? new Date(academicYear.startDate).toISOString().split('T')[0] : '',
      endDate: academicYear.endDate ? new Date(academicYear.endDate).toISOString().split('T')[0] : '',
      isActive: academicYear.isActive
    });
    setShowAcademicYearModal(true);
  };

  const handleSaveAcademicYear = async () => {
    if (!academicYearForm.year) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Academic year is required.' });
      return;
    }

    try {
      if (editingAcademicYear) {
        await updateAcademicYear(editingAcademicYear._id, academicYearForm);
        Swal.fire({ 
          icon: 'success', 
          title: 'Updated', 
          text: 'Academic year updated successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        await createAcademicYear(academicYearForm);
        Swal.fire({ 
          icon: 'success', 
          title: 'Created', 
          text: 'Academic year created successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      setShowAcademicYearModal(false);
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleDeleteAcademicYear = async (id, year) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the academic year "${year}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;

    try {
      await deleteAcademicYear(id);
      Swal.fire({ 
        icon: 'success', 
        title: 'Deleted', 
        text: 'Academic year deleted successfully!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleToggleAcademicYear = async (academicYear) => {
    try {
      await toggleAcademicYearStatus(academicYear._id);
      Swal.fire({ 
        icon: 'success', 
        title: 'Updated', 
        text: `Academic year ${academicYear.isActive ? 'deactivated' : 'activated'} successfully!`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  // Sections Management
  const handleAddSection = () => {
    setEditingSection(null);
    setSectionForm({ name: '' });
    setShowSectionModal(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionForm({ name: section.name });
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!sectionForm.name) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Section name is required.' });
      return;
    }

    try {
      if (editingSection) {
        await updateSection(editingSection._id, sectionForm);
        Swal.fire({ 
          icon: 'success', 
          title: 'Updated', 
          text: 'Section updated successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        await addSection(sectionForm);
        Swal.fire({ 
          icon: 'success', 
          title: 'Created', 
          text: 'Section created successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      setShowSectionModal(false);
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleDeleteSection = async (id) => {
    const section = sections.find(s => s._id === id);
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the section "${section.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;

    try {
      await deleteSection(id);
      Swal.fire({ 
        icon: 'success', 
        title: 'Deleted', 
        text: 'Section deleted successfully!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleToggleSection = async (section) => {
    try {
      await updateSection(section._id, { isActive: !section.isActive });
      Swal.fire({ 
        icon: 'success', 
        title: 'Updated', 
        text: `Section ${section.isActive ? 'deactivated' : 'activated'} successfully!`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  // Year Levels Management
  const handleAddYearLevel = () => {
    setEditingYearLevel(null);
    setYearLevelForm({ name: '' });
    setShowYearLevelModal(true);
  };

  const handleEditYearLevel = (yearLevel) => {
    setEditingYearLevel(yearLevel);
    setYearLevelForm({ name: yearLevel.name });
    setShowYearLevelModal(true);
  };

  const handleSaveYearLevel = async () => {
    if (!yearLevelForm.name) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Year level name is required.' });
      return;
    }

    try {
      if (editingYearLevel) {
        await updateYearLevel(editingYearLevel._id, yearLevelForm);
        Swal.fire({ 
          icon: 'success', 
          title: 'Updated', 
          text: 'Year level updated successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        await addYearLevel(yearLevelForm);
        Swal.fire({ 
          icon: 'success', 
          title: 'Created', 
          text: 'Year level created successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      setShowYearLevelModal(false);
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleDeleteYearLevel = async (id) => {
    const yearLevel = yearLevels.find(yl => yl._id === id);
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the year level "${yearLevel.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;

    try {
      await deleteYearLevel(id);
      Swal.fire({ 
        icon: 'success', 
        title: 'Deleted', 
        text: 'Year level deleted successfully!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleToggleYearLevel = async (yearLevel) => {
    try {
      await updateYearLevel(yearLevel._id, { isActive: !yearLevel.isActive });
      Swal.fire({ 
        icon: 'success', 
        title: 'Updated', 
        text: `Year level ${yearLevel.isActive ? 'deactivated' : 'activated'} successfully!`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  // Departments Management
  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setDepartmentForm({ name: '' });
    setShowDepartmentModal(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setDepartmentForm({ name: department.name });
    setShowDepartmentModal(true);
  };

  const handleSaveDepartment = async () => {
    if (!departmentForm.name) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Department name is required.' });
      return;
    }

    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment._id, departmentForm);
        Swal.fire({ 
          icon: 'success', 
          title: 'Updated', 
          text: 'Department updated successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        await addDepartment(departmentForm);
        Swal.fire({ 
          icon: 'success', 
          title: 'Created', 
          text: 'Department created successfully!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
      setShowDepartmentModal(false);
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleDeleteDepartment = async (id) => {
    const department = departments.find(d => d._id === id);
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the department "${department.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;

    try {
      await deleteDepartment(id);
      Swal.fire({ 
        icon: 'success', 
        title: 'Deleted', 
        text: 'Department deleted successfully!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleToggleDepartment = async (department) => {
    try {
      await updateDepartment(department._id, { isActive: !department.isActive });
      Swal.fire({ 
        icon: 'success', 
        title: 'Updated', 
        text: `Department ${department.isActive ? 'deactivated' : 'activated'} successfully!`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      fetchSettings();
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  if (loading) {
    return (
      <div className="registration-management-page">
        <div className="loading-section">
          <FaSpinner className="loading-spinner" />
          <h3>Loading Registration Settings</h3>
          <p>Please wait while we fetch your registration data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="registration-management-page">
        <div className="error-section">
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={() => fetchSettings()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-management-page">
      <div className="registration-management-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`registration-management-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <div className="icon-symbol">📋</div>
            </div>
            <div className="header-text">
              <h1 className="header-title">Registration Management</h1>
              <p className="header-subtitle">Manage registration options for academic years, sections, year levels, and departments</p>
            </div>
          </div>
          
          <div className="management-stats">
            <div className="stat-item">
              <span className="stat-number">{academicYears.length}</span>
              <span className="stat-label">Academic Years</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{sections.length}</span>
              <span className="stat-label">Sections</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{yearLevels.length}</span>
              <span className="stat-label">Year Levels</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{departments.length}</span>
              <span className="stat-label">Departments</span>
            </div>
          </div>
        </div>

        {/* Management Tabs */}
        <div className="management-tabs">
          <div className="tabs-header">
            <button 
              className={`tab-button ${activeTab === 'academic-years' ? 'active' : ''}`}
              onClick={() => setActiveTab('academic-years')}
            >
              <FaCalendarAlt className="tab-icon" />
              <span>Academic Years</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'sections' ? 'active' : ''}`}
              onClick={() => setActiveTab('sections')}
            >
              <FaUsers className="tab-icon" />
              <span>Sections</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'year-levels' ? 'active' : ''}`}
              onClick={() => setActiveTab('year-levels')}
            >
              <FaGraduationCap className="tab-icon" />
              <span>Year Levels</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`}
              onClick={() => setActiveTab('departments')}
            >
              <FaBuilding className="tab-icon" />
              <span>Departments</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Academic Years Tab */}
            {activeTab === 'academic-years' && (
              <div className="tab-panel">
                <div className="section-header">
                  <h3 className="section-title">Academic Years</h3>
                  <button className="add-button" onClick={handleAddAcademicYear}>
                    <FaPlus className="button-icon" />
                    <span>Add Academic Year</span>
                  </button>
                </div>
                
                {academicYears.length === 0 ? (
                  <div className="empty-state">
                    <FaCalendarAlt className="empty-icon" />
                    <h4>No Academic Years</h4>
                    <p>Start by adding your first academic year</p>
                  </div>
                ) : (
                  <div className="items-grid">
                    {academicYears.map(academicYear => (
                      <div key={academicYear._id} className={`management-card ${academicYear.isActive ? 'active' : 'inactive'}`}>
                        <div className="card-header">
                          <h5 className="card-title">{academicYear.year || academicYear.name}</h5>
                          <div className={`status-badge ${academicYear.isActive ? 'active' : 'inactive'}`}>
                            {academicYear.isActive ? <FaCheckCircle className="status-icon" /> : <FaTimesCircle className="status-icon" />}
                            <span className="status-text">{academicYear.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                        
                        <div className="card-content">
                          <p className="description">{academicYear.description || 'No description'}</p>
                          
                          <div className="date-range">
                            <div className="date-item">
                              <FaCalendar className="date-icon" />
                              <span className="date-label">Start:</span>
                              <span className="date-value">
                                {academicYear.startDate 
                                  ? new Date(academicYear.startDate).toLocaleDateString() 
                                  : 'Not set'
                                }
                              </span>
                            </div>
                            <div className="date-item">
                              <FaCalendar className="date-icon" />
                              <span className="date-label">End:</span>
                              <span className="date-value">
                                {academicYear.endDate 
                                  ? new Date(academicYear.endDate).toLocaleDateString() 
                                  : 'Not set'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card-actions">
                          <button 
                            className="action-button edit-button"
                            onClick={() => handleEditAcademicYear(academicYear)}
                          >
                            <FaEdit className="button-icon" />
                            <span>Edit</span>
                          </button>
                          <button 
                            className={`action-button toggle-button ${academicYear.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleAcademicYear(academicYear)}
                          >
                            {academicYear.isActive ? <FaToggleOff className="button-icon" /> : <FaToggleOn className="button-icon" />}
                            <span>{academicYear.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteAcademicYear(academicYear._id, academicYear.year || academicYear.name)}
                          >
                            <FaTrash className="button-icon" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sections Tab */}
            {activeTab === 'sections' && (
              <div className="tab-panel">
                <div className="section-header">
                  <h3 className="section-title">Sections</h3>
                  <button className="add-button" onClick={handleAddSection}>
                    <FaPlus className="button-icon" />
                    <span>Add Section</span>
                  </button>
                </div>
                
                {sections.length === 0 ? (
                  <div className="empty-state">
                    <FaUsers className="empty-icon" />
                    <h4>No Sections</h4>
                    <p>Start by adding your first section</p>
                  </div>
                ) : (
                  <div className="items-grid">
                    {sections.map(section => (
                      <div key={section._id} className={`management-card ${section.isActive ? 'active' : 'inactive'}`}>
                        <div className="card-header">
                          <h5 className="card-title">{section.name}</h5>
                          <div className={`status-badge ${section.isActive ? 'active' : 'inactive'}`}>
                            {section.isActive ? <FaCheckCircle className="status-icon" /> : <FaTimesCircle className="status-icon" />}
                            <span className="status-text">{section.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                        
                        <div className="card-content">
                          <div className="created-date">
                            <FaClock className="date-icon" />
                            <span>Created: {new Date(section.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="card-actions">
                          <button 
                            className="action-button edit-button"
                            onClick={() => handleEditSection(section)}
                          >
                            <FaEdit className="button-icon" />
                            <span>Edit</span>
                          </button>
                          <button 
                            className={`action-button toggle-button ${section.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleSection(section)}
                          >
                            {section.isActive ? <FaToggleOff className="button-icon" /> : <FaToggleOn className="button-icon" />}
                            <span>{section.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteSection(section._id)}
                          >
                            <FaTrash className="button-icon" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Year Levels Tab */}
            {activeTab === 'year-levels' && (
              <div className="tab-panel">
                <div className="section-header">
                  <h3 className="section-title">Year Levels</h3>
                  <button className="add-button" onClick={handleAddYearLevel}>
                    <FaPlus className="button-icon" />
                    <span>Add Year Level</span>
                  </button>
                </div>
                
                {yearLevels.length === 0 ? (
                  <div className="empty-state">
                    <FaGraduationCap className="empty-icon" />
                    <h4>No Year Levels</h4>
                    <p>Start by adding your first year level</p>
                  </div>
                ) : (
                  <div className="items-grid">
                    {yearLevels.map(yearLevel => (
                      <div key={yearLevel._id} className={`management-card ${yearLevel.isActive ? 'active' : 'inactive'}`}>
                        <div className="card-header">
                          <h5 className="card-title">{yearLevel.name}</h5>
                          <div className={`status-badge ${yearLevel.isActive ? 'active' : 'inactive'}`}>
                            {yearLevel.isActive ? <FaCheckCircle className="status-icon" /> : <FaTimesCircle className="status-icon" />}
                            <span className="status-text">{yearLevel.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                        
                        <div className="card-content">
                          <div className="created-date">
                            <FaClock className="date-icon" />
                            <span>Created: {new Date(yearLevel.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="card-actions">
                          <button 
                            className="action-button edit-button"
                            onClick={() => handleEditYearLevel(yearLevel)}
                          >
                            <FaEdit className="button-icon" />
                            <span>Edit</span>
                          </button>
                          <button 
                            className={`action-button toggle-button ${yearLevel.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleYearLevel(yearLevel)}
                          >
                            {yearLevel.isActive ? <FaToggleOff className="button-icon" /> : <FaToggleOn className="button-icon" />}
                            <span>{yearLevel.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteYearLevel(yearLevel._id)}
                          >
                            <FaTrash className="button-icon" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div className="tab-panel">
                <div className="section-header">
                  <h3 className="section-title">Departments</h3>
                  <button className="add-button" onClick={handleAddDepartment}>
                    <FaPlus className="button-icon" />
                    <span>Add Department</span>
                  </button>
                </div>
                
                {departments.length === 0 ? (
                  <div className="empty-state">
                    <FaBuilding className="empty-icon" />
                    <h4>No Departments</h4>
                    <p>Start by adding your first department</p>
                  </div>
                ) : (
                  <div className="items-grid">
                    {departments.map(department => (
                      <div key={department._id} className={`management-card ${department.isActive ? 'active' : 'inactive'}`}>
                        <div className="card-header">
                          <h5 className="card-title">{department.name}</h5>
                          <div className={`status-badge ${department.isActive ? 'active' : 'inactive'}`}>
                            {department.isActive ? <FaCheckCircle className="status-icon" /> : <FaTimesCircle className="status-icon" />}
                            <span className="status-text">{department.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                        
                        <div className="card-content">
                          <div className="created-date">
                            <FaClock className="date-icon" />
                            <span>Created: {new Date(department.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="card-actions">
                          <button 
                            className="action-button edit-button"
                            onClick={() => handleEditDepartment(department)}
                          >
                            <FaEdit className="button-icon" />
                            <span>Edit</span>
                          </button>
                          <button 
                            className={`action-button toggle-button ${department.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleDepartment(department)}
                          >
                            {department.isActive ? <FaToggleOff className="button-icon" /> : <FaToggleOn className="button-icon" />}
                            <span>{department.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                          <button 
                            className="action-button delete-button"
                            onClick={() => handleDeleteDepartment(department._id)}
                          >
                            <FaTrash className="button-icon" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Academic Year Modal */}
        {showAcademicYearModal && (
          <div className="modal-overlay" onClick={() => setShowAcademicYearModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingAcademicYear ? 'Edit Academic Year' : 'Add New Academic Year'}
                </h3>
                <button className="modal-close" onClick={() => setShowAcademicYearModal(false)}>×</button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveAcademicYear(); }} className="modal-form">
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">
                      <FaCalendarAlt className="label-icon" />
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={academicYearForm.year}
                      onChange={(e) => setAcademicYearForm(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="e.g., 2024-2025"
                      className="form-input"
                      required
                    />
                    <p className="form-hint">Format: YYYY-YYYY (e.g., 2024-2025)</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FaIdCard className="label-icon" />
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={academicYearForm.description}
                      onChange={(e) => setAcademicYearForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Current Academic Year"
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <FaCalendar className="label-icon" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={academicYearForm.startDate}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <FaCalendar className="label-icon" />
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={academicYearForm.endDate}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-switch-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={academicYearForm.isActive}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="form-switch"
                      />
                      <span className="switch-slider"></span>
                      <span className="switch-text">Active</span>
                    </label>
                    <p className="form-hint">Active academic years will appear in the registration dropdown</p>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="cancel-button" onClick={() => setShowAcademicYearModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    {editingAcademicYear ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Section Modal */}
        {showSectionModal && (
          <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{editingSection ? 'Edit Section' : 'Add Section'}</h3>
                <button className="modal-close" onClick={() => setShowSectionModal(false)}>×</button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveSection(); }} className="modal-form">
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">
                      <FaUsers className="label-icon" />
                      Section Name
                    </label>
                    <input
                      type="text"
                      value={sectionForm.name}
                      onChange={(e) => setSectionForm({ name: e.target.value })}
                      placeholder="e.g., A, B, C"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="cancel-button" onClick={() => setShowSectionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Year Level Modal */}
        {showYearLevelModal && (
          <div className="modal-overlay" onClick={() => setShowYearLevelModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{editingYearLevel ? 'Edit Year Level' : 'Add Year Level'}</h3>
                <button className="modal-close" onClick={() => setShowYearLevelModal(false)}>×</button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveYearLevel(); }} className="modal-form">
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">
                      <FaGraduationCap className="label-icon" />
                      Year Level Name
                    </label>
                    <input
                      type="text"
                      value={yearLevelForm.name}
                      onChange={(e) => setYearLevelForm({ name: e.target.value })}
                      placeholder="e.g., 1st Year, 2nd Year"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="cancel-button" onClick={() => setShowYearLevelModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Department Modal */}
        {showDepartmentModal && (
          <div className="modal-overlay" onClick={() => setShowDepartmentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{editingDepartment ? 'Edit Department' : 'Add Department'}</h3>
                <button className="modal-close" onClick={() => setShowDepartmentModal(false)}>×</button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveDepartment(); }} className="modal-form">
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">
                      <FaBuilding className="label-icon" />
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={departmentForm.name}
                      onChange={(e) => setDepartmentForm({ name: e.target.value })}
                      placeholder="e.g., School of Arts and Sciences"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="cancel-button" onClick={() => setShowDepartmentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistrationManagementPage; 