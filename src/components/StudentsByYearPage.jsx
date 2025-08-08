// frontend/src/components/StudentsByYearPage.jsx
// Fresh Modern Students By Year Page Design

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaGraduationCap, FaSearch, FaDownload, FaUsers, FaSpinner, 
  FaExclamationTriangle, FaFilter, FaCheckCircle, FaTimesCircle,
  FaCalendar, FaIdCard, FaBuilding, FaClock, FaUserGraduate,
  FaChartBar, FaFileAlt, FaTimes
} from 'react-icons/fa';
import { getStudentsByYear } from '../api/api';
import './StudentsByYearPage.css';

function StudentsByYearPage() {
  const [studentsByYear, setStudentsByYear] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    yearLevels: [],
    sections: []
  });
  const [pdfFilters, setPdfFilters] = useState({
    department: '',
    yearLevel: '',
    section: ''
  });
  const [frontendFilters, setFrontendFilters] = useState({
    department: '',
    yearLevel: '',
    section: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view this page.');
          setLoading(false);
          return;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role || localStorage.getItem('role');
        
        if (!role || (role !== 'Admin' && role !== 'Staff')) {
          setError(`Access denied. This page requires Admin or Staff role. Your current role is: ${role || 'Unknown'}`);
          setLoading(false);
          return;
        }

        const data = await getStudentsByYear();
        setStudentsByYear(data || {});
        setError('');
      } catch (err) {
        console.error('Error fetching students:', err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (err.response?.status === 403) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const role = user.role || localStorage.getItem('role');
          setError(`Access denied. This page requires Admin or Staff role. Your current role is: ${role || 'Unknown'}`);
        } else {
          setError(
            err.response?.data?.message || 
            'Failed to fetch students by year. Please try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchFilterOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/settings/public', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const settings = await response.json();
          setFilterOptions({
            departments: settings.departments?.filter(d => d.isActive).map(d => d.name) || [],
            yearLevels: settings.yearLevels?.filter(y => y.isActive).map(y => y.name) || [],
            sections: settings.sections?.filter(s => s.isActive).map(s => s.name) || []
          });
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchStudents();
    fetchFilterOptions();
  }, []);

  const years = Object.keys(studentsByYear);

  const filterStudents = (students) => {
    let filtered = students.filter(student =>
      (student.name && student.name.toLowerCase().includes(search.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(search.toLowerCase())) ||
      (student.department && student.department.toLowerCase().includes(search.toLowerCase()))
    );

    // Apply frontend filters
    if (frontendFilters.department) {
      filtered = filtered.filter(student => 
        student.department && student.department === frontendFilters.department
      );
    }

    if (frontendFilters.yearLevel) {
      filtered = filtered.filter(student => 
        student.yearLevel && student.yearLevel === frontendFilters.yearLevel
      );
    }

    if (frontendFilters.section) {
      filtered = filtered.filter(student => 
        student.section && student.section === frontendFilters.section
      );
    }

    return filtered;
  };

  const handlePdfFilterChange = (filterType, value) => {
    setPdfFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleFrontendFilterChange = (filterType, value) => {
    setFrontendFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFrontendFilters({
      department: '',
      yearLevel: '',
      section: ''
    });
    setSearch('');
  };

  const clearFilter = (filterType) => {
    setFrontendFilters(prev => ({
      ...prev,
      [filterType]: ''
    }));
  };

  const handleDownloadPDF = async () => {
    if (!selectedYear) {
      alert('Please select an academic year first.');
      return;
    }

    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters based on selected filters
      const params = new URLSearchParams();
      params.append('year', selectedYear);
      
      if (pdfFilters.department) {
        params.append('department', pdfFilters.department);
      }
      if (pdfFilters.yearLevel) {
        params.append('yearLevel', pdfFilters.yearLevel);
      }
      if (pdfFilters.section) {
        params.append('section', pdfFilters.section);
      }

      const response = await fetch(`/api/reports/students-by-year?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-${selectedYear}${pdfFilters.department ? `-${pdfFilters.department}` : ''}${pdfFilters.yearLevel ? `-${pdfFilters.yearLevel}` : ''}${pdfFilters.section ? `-${pdfFilters.section}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getCompletionStatus = (hours) => {
    if (hours >= 40) return { status: 'completed', color: '#10b981', text: '40+ Hours Completed' };
    if (hours >= 30) return { status: 'near', color: '#f59e0b', text: 'Near Completion' };
    if (hours >= 20) return { status: 'progress', color: '#3b82f6', text: 'In Progress' };
    return { status: 'started', color: '#6b7280', text: 'Just Started' };
  };

  // Check if any PDF filters are selected
  const hasPdfFilters = pdfFilters.department || pdfFilters.yearLevel || pdfFilters.section;
  
  // Check if any frontend filters are active
  const hasActiveFilters = frontendFilters.department || frontendFilters.yearLevel || frontendFilters.section || search;

  if (loading) {
    return (
      <div className="students-by-year-page">
        <div className="loading-section">
          <div className="loading-content">
            <FaSpinner className="loading-spinner" />
            <h3>Loading Students Data</h3>
            <p>Please wait while we fetch the student information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="students-by-year-page">
        <div className="error-section">
          <div className="error-content">
            <FaExclamationTriangle className="error-icon" />
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="students-by-year-page">
      <div className="students-by-year-background">
        <div className="background-pattern"></div>
      </div>

      <div className={`students-by-year-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <div className="icon-symbol">🎓</div>
            </div>
            <div className="header-text">
              <h1 className="header-title">Students by Academic Year</h1>
              <p className="header-subtitle">Comprehensive view of student data organized by academic year</p>
            </div>
          </div>
          
          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-icon">
                <FaCalendar />
              </div>
              <div className="stat-content">
                <span className="stat-number">{years.length}</span>
                <span className="stat-label">Academic Years</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <span className="stat-number">
                  {selectedYear && studentsByYear[selectedYear] 
                    ? filterStudents(studentsByYear[selectedYear]).length 
                    : 0
                  }
                </span>
                <span className="stat-label">Filtered Students</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <span className="stat-number">
                  {selectedYear && studentsByYear[selectedYear]
                    ? filterStudents(studentsByYear[selectedYear]).filter(s => s.totalHours >= 40).length
                    : 0
                  }
                </span>
                <span className="stat-label">40+ Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section">
          <div className="controls-left">
            <div className="year-selector">
              <label className="control-label">
                <FaCalendar className="label-icon" />
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="year-select"
              >
                <option value="">Select Academic Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="search-box">
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              <span>Filters</span>
              {hasActiveFilters && <span className="filter-badge">•</span>}
            </button>
          </div>
          
          <div className="controls-right">
            <div className="view-toggle">
              <button 
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FaChartBar />
                <span>Grid</span>
              </button>
              <button 
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FaFileAlt />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Frontend Filters Section */}
        {showFilters && (
          <div className="frontend-filters-section">
            <div className="filters-header">
              <h3 className="filters-title">
                <FaFilter className="filters-icon" />
                Filter Students
              </h3>
              <button 
                className="clear-filters-button"
                onClick={clearAllFilters}
              >
                <FaTimes />
                <span>Clear All</span>
              </button>
            </div>
            
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">
                  <FaBuilding className="filter-icon" />
                  Department
                </label>
                <select 
                  className="filter-select"
                  value={frontendFilters.department}
                  onChange={e => handleFrontendFilterChange('department', e.target.value)}
                >
                  <option value="">All Departments</option>
                  {filterOptions.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {frontendFilters.department && (
                  <button 
                    className="clear-filter-button"
                    onClick={() => clearFilter('department')}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              
              <div className="filter-group">
                <label className="filter-label">
                  <FaUserGraduate className="filter-icon" />
                  Year Level
                </label>
                <select 
                  className="filter-select"
                  value={frontendFilters.yearLevel}
                  onChange={e => handleFrontendFilterChange('yearLevel', e.target.value)}
                >
                  <option value="">All Year Levels</option>
                  {filterOptions.yearLevels.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {frontendFilters.yearLevel && (
                  <button 
                    className="clear-filter-button"
                    onClick={() => clearFilter('yearLevel')}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              
              <div className="filter-group">
                <label className="filter-label">
                  <FaUsers className="filter-icon" />
                  Section
                </label>
                <select 
                  className="filter-select"
                  value={frontendFilters.section}
                  onChange={e => handleFrontendFilterChange('section', e.target.value)}
                >
                  <option value="">All Sections</option>
                  {filterOptions.sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                {frontendFilters.section && (
                  <button 
                    className="clear-filter-button"
                    onClick={() => clearFilter('section')}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="active-filters">
                <span className="active-filters-label">Active Filters:</span>
                {search && (
                  <span className="active-filter-tag">
                    Search: "{search}"
                    <button 
                      className="remove-filter"
                      onClick={() => setSearch('')}
                    >
                      <FaTimes />
                    </button>
                  </span>
                )}
                {frontendFilters.department && (
                  <span className="active-filter-tag">
                    Department: {frontendFilters.department}
                    <button 
                      className="remove-filter"
                      onClick={() => clearFilter('department')}
                    >
                      <FaTimes />
                    </button>
                  </span>
                )}
                {frontendFilters.yearLevel && (
                  <span className="active-filter-tag">
                    Year Level: {frontendFilters.yearLevel}
                    <button 
                      className="remove-filter"
                      onClick={() => clearFilter('yearLevel')}
                    >
                      <FaTimes />
                    </button>
                  </span>
                )}
                {frontendFilters.section && (
                  <span className="active-filter-tag">
                    Section: {frontendFilters.section}
                    <button 
                      className="remove-filter"
                      onClick={() => clearFilter('section')}
                    >
                      <FaTimes />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* PDF Generation Options */}
        {selectedYear && (
          <div className="pdf-options-section">
            <div className="pdf-options-header">
              <h3 className="pdf-options-title">
                <FaDownload className="pdf-options-icon" />
                PDF Generation Options
              </h3>
              <p className="pdf-options-subtitle">Customize your PDF report with additional filters and options</p>
            </div>
            
            <div className="pdf-options-grid">
              <div className="pdf-option-group">
                <label className="pdf-option-label">
                  <FaBuilding className="option-icon" />
                  Department Filter
                </label>
                <select 
                  className="pdf-option-select"
                  value={pdfFilters.department}
                  onChange={e => handlePdfFilterChange('department', e.target.value)}
                >
                  <option value="">All Departments</option>
                  {filterOptions.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="pdf-option-group">
                <label className="pdf-option-label">
                  <FaUserGraduate className="option-icon" />
                  Year Level Filter
                </label>
                <select 
                  className="pdf-option-select"
                  value={pdfFilters.yearLevel}
                  onChange={e => handlePdfFilterChange('yearLevel', e.target.value)}
                >
                  <option value="">All Year Levels</option>
                  {filterOptions.yearLevels.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="pdf-option-group">
                <label className="pdf-option-label">
                  <FaUsers className="option-icon" />
                  Section Filter
                </label>
                <select 
                  className="pdf-option-select"
                  value={pdfFilters.section}
                  onChange={e => handlePdfFilterChange('section', e.target.value)}
                >
                  <option value="">All Sections</option>
                  {filterOptions.sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* PDF Download Button */}
            <div className="pdf-download-section">
              <button 
                className="download-button"
                onClick={handleDownloadPDF} 
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <FaSpinner className="spinner-icon" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <FaDownload className="button-icon" />
                    <span>
                      Generate PDF Report
                      {hasPdfFilters && (
                        <span className="filter-indicator">
                          {pdfFilters.department && ` • ${pdfFilters.department}`}
                          {pdfFilters.yearLevel && ` • ${pdfFilters.yearLevel}`}
                          {pdfFilters.section && ` • ${pdfFilters.section}`}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!selectedYear ? (
          <div className="empty-state">
            <div className="empty-content">
              <FaGraduationCap className="empty-icon" />
              <h3>Select an Academic Year</h3>
              <p>Choose an academic year from the dropdown above to view student information</p>
            </div>
          </div>
        ) : !studentsByYear[selectedYear] || filterStudents(studentsByYear[selectedYear]).length === 0 ? (
          <div className="empty-state">
            <div className="empty-content">
              <FaUsers className="empty-icon" />
              <h3>No Students Found</h3>
              <p>No students found for {selectedYear} with the current search criteria</p>
              <p className="pdf-note">
                <FaDownload className="note-icon" />
                You can still generate a PDF report using the filters above, even if no students are displayed
              </p>
            </div>
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <div className="results-info">
                <h3 className="results-title">
                  <FaUsers className="results-icon" />
                  {selectedYear} - Students
                </h3>
                <span className="results-count">
                  {filterStudents(studentsByYear[selectedYear]).length} students found
                  {hasActiveFilters && (
                    <span className="filtered-indicator">
                      (filtered from {studentsByYear[selectedYear].length} total)
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="students-grid">
                {filterStudents(studentsByYear[selectedYear]).map((student, index) => {
                  const completionStatus = getCompletionStatus(student.totalHours || 0);
                  return (
                    <div key={student._id} className="student-card">
                      <div className="student-header">
                        <div className="student-avatar">
                          <FaUserGraduate />
                        </div>
                        <div className="student-number">#{index + 1}</div>
                        <div className="student-hours">
                          <span 
                            className="hours-badge"
                            style={{ backgroundColor: completionStatus.color }}
                          >
                            {student.totalHours || 0} hours
                          </span>
                        </div>
                      </div>
                      
                      <div className="student-info">
                        <h5 className="student-name">{student.name}</h5>
                        <p className="student-email">{student.email}</p>
                        <p className="student-department">
                          <FaBuilding className="info-icon" />
                          {student.department || 'Unknown Department'}
                        </p>
                        {student.yearLevel && (
                          <p className="student-year-level">
                            <FaUserGraduate className="info-icon" />
                            {student.yearLevel}
                          </p>
                        )}
                        {student.section && (
                          <p className="student-section">
                            <FaUsers className="info-icon" />
                            {student.section}
                          </p>
                        )}
                      </div>
                      
                      <div className="student-status">
                        <div className="status-item">
                          <FaCheckCircle className="status-icon" />
                          <span>{completionStatus.text}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="students-list">
                <div className="list-header">
                  <div className="list-column">#</div>
                  <div className="list-column">Name</div>
                  <div className="list-column">Email</div>
                  <div className="list-column">Department</div>
                  <div className="list-column">Year Level</div>
                  <div className="list-column">Section</div>
                  <div className="list-column">Hours</div>
                  <div className="list-column">Status</div>
                </div>
                
                {filterStudents(studentsByYear[selectedYear]).map((student, index) => {
                  const completionStatus = getCompletionStatus(student.totalHours || 0);
                  return (
                    <div key={student._id} className="list-item">
                      <div className="list-column">{index + 1}</div>
                      <div className="list-column">
                        <div className="student-name">{student.name}</div>
                      </div>
                      <div className="list-column">
                        <div className="student-email">{student.email}</div>
                      </div>
                      <div className="list-column">
                        <div className="student-department">{student.department || 'Unknown'}</div>
                      </div>
                      <div className="list-column">
                        <div className="student-year-level">{student.yearLevel || 'N/A'}</div>
                      </div>
                      <div className="list-column">
                        <div className="student-section">{student.section || 'N/A'}</div>
                      </div>
                      <div className="list-column">
                        <span 
                          className="hours-badge"
                          style={{ backgroundColor: completionStatus.color }}
                        >
                          {student.totalHours || 0} hours
                        </span>
                      </div>
                      <div className="list-column">
                        <div className="status-item">
                          <FaCheckCircle className="status-icon" />
                          <span>{completionStatus.text}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsByYearPage;