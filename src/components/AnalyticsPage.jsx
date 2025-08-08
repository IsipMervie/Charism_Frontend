import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../api/api';
import { Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { FaUsers, FaCalendarAlt, FaCheckCircle, FaComments, FaClock, FaGraduationCap } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AnalyticsPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await getAnalytics();
        setData(analytics || {});
        setError('');
      } catch (err) {
        setData({});
        setError('Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getValue = (key) => {
    if (error) return <span style={{ color: 'red' }}>Error</span>;
    return typeof data[key] === 'number' ? data[key] : 0;
  };

  // User Role Distribution Pie Chart
  const userRoleData = {
    labels: ['Students', 'Staff', 'Admin'],
    datasets: [
      {
        data: [getValue('studentsCount'), getValue('staffCount'), getValue('adminCount')],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Event Status Distribution Doughnut Chart
  const eventStatusData = {
    labels: ['Active Events', 'Completed Events'],
    datasets: [
      {
        data: [getValue('activeEvents'), getValue('completedEvents')],
        backgroundColor: [
          '#4BC0C0',
          '#FF9F40'
        ],
        borderColor: [
          '#4BC0C0',
          '#FF9F40'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Attendance vs Approved Attendance Bar Chart
  const attendanceData = {
    labels: ['Total Attendance', 'Approved Attendance'],
    datasets: [
      {
        label: 'Attendance Count',
        data: [getValue('totalAttendance'), getValue('approvedAttendance')],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Recent Activity Line Chart (real data from backend)
  const recentActivityData = {
    labels: ['7 days ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday'],
    datasets: [
      {
        label: 'New Events',
        data: data.dailyEvents || [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'New Users',
        data: data.dailyUsers || [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Department Statistics Bar Chart
  const departmentData = {
    labels: (data.departmentStats || []).map(dept => dept.department || 'Unknown'),
    datasets: [
      {
        label: 'Students',
        data: (data.departmentStats || []).map(dept => dept.students || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
      {
        label: 'Events',
        data: (data.departmentStats || []).map(dept => dept.events || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Academic Year Statistics Bar Chart
  const yearData = {
    labels: (data.yearStats || []).map(year => `Year ${year.academicYear || 'Unknown'}`),
    datasets: [
      {
        label: 'Students',
        data: (data.yearStats || []).map(year => year.students || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
      {
        label: 'Events',
        data: (data.yearStats || []).map(year => year.events || 0),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'User Distribution',
        font: { size: 16, weight: 'bold' }
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Event Status Distribution',
        font: { size: 16, weight: 'bold' }
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Attendance Overview',
        font: { size: 16, weight: 'bold' }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Recent Activity (Last 7 Days)',
        font: { size: 16, weight: 'bold' }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const departmentBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Department Statistics',
        font: { size: 16, weight: 'bold' }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const yearBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Academic Year Statistics',
        font: { size: 16, weight: 'bold' }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const metricCards = [
    { 
      key: 'totalUsers', 
      label: 'Total Users', 
      icon: <FaUsers size={24} />,
      color: '#007bff'
    },
    { 
      key: 'totalEvents', 
      label: 'Total Events', 
      icon: <FaCalendarAlt size={24} />,
      color: '#28a745'
    },
    { 
      key: 'totalAttendance', 
      label: 'Total Attendance', 
      icon: <FaCheckCircle size={24} />,
      color: '#ffc107'
    },
    { 
      key: 'totalMessages', 
      label: 'Total Messages', 
      icon: <FaComments size={24} />,
      color: '#dc3545'
    },
    { 
      key: 'totalHours', 
      label: 'Total Hours', 
      icon: <FaClock size={24} />,
      color: '#17a2b8'
    },
    { 
      key: 'approvedAttendance', 
      label: 'Approved Attendance', 
      icon: <FaGraduationCap size={24} />,
      color: '#6f42c1'
    },
  ];

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" size="lg">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading analytics data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <div className="mb-4">
        <h1 className="text-center mb-3">📊 Analytics Dashboard</h1>
        <p className="text-center text-muted">Comprehensive overview of your community engagement platform</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error Loading Analytics</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Metric Cards */}
      <Row className="mb-4">
        {metricCards.map(({ key, label, icon, color }) => (
          <Col lg={2} md={4} sm={6} key={key} className="mb-3">
            <Card className="h-100 shadow-sm border-0" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Body className="text-center">
                <div className="mb-2" style={{ color }}>
                  {icon}
                </div>
                <Card.Title className="h6 mb-1">{label}</Card.Title>
                <Card.Text className="h4 mb-0 fw-bold" style={{ color }}>
                  {getValue(key).toLocaleString()}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row 1 */}
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Pie data={userRoleData} options={pieOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Doughnut data={eventStatusData} options={doughnutOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Bar data={attendanceData} options={barOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Line data={recentActivityData} options={lineOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 3 - Department and Year Statistics */}
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Bar data={departmentData} options={departmentBarOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Bar data={yearData} options={yearBarOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Summary Statistics */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">📈 Summary Statistics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Average Hours per Student</h6>
                    <h4 className="text-primary">
                      {data.totalUsers > 0 ? (getValue('totalHours') / getValue('studentsCount')).toFixed(1) : 0}
                    </h4>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Approval Rate</h6>
                    <h4 className="text-success">
                      {getValue('totalAttendance') > 0 
                        ? ((getValue('approvedAttendance') / getValue('totalAttendance')) * 100).toFixed(1) 
                        : 0}%
                    </h4>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Recent Events (30 days)</h6>
                    <h4 className="text-warning">{getValue('recentEvents')}</h4>
                  </div>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Recent Users (30 days)</h6>
                    <h4 className="text-info">{getValue('recentUsers')}</h4>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AnalyticsPage;