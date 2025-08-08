import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import EventListPage from './components/EventListPage';
import EventDetailsPage from './components/EventDetailsPage';
import EditEventPage from './components/EditEventPage'; // <-- Import the edit page
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminManageEventsPage from './components/AdminManageEventsPage';
import AnalyticsPage from './components/AnalyticsPage';
import Students40HoursPage from './components/Students40HoursPage';
import StudentsByYearPage from './components/StudentsByYearPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import ChangePasswordPage from './components/ChangePasswordPage';
import PrivateRoute from './components/PrivateRoute';
import VerifyEmailPage from './components/VerifyEmailPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ContactUsPage from './components/ContactUsPage';
import MyParticipationPage from './components/MyParticipationPage';
import AdminManageMessagesPage from './components/AdminManageMessagesPage';
import EventAttendancePage from './components/EventAttendancePage';
import CreateEventPage from './components/CreateEventPage';
import ManageUsersPage from './components/ManageUsersPage';
import SchoolSettingsPage from './components/SchoolSettingsPage';
import EventParticipantsPage from './components/EventParticipants';
import StaffApprovalPage from './components/StaffApprovalPage';
import RegistrationManagementPage from './components/RegistrationManagementPage';

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} /> {/* View Details */}
        <Route
          path="/events/:eventId/participants"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff']}>
              <EventParticipantsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:eventId/edit"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff']}>
              <EditEventPage />
            </PrivateRoute>
          }
        />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/contact" element={<ContactUsPage />} />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute requiredRoles={['Admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-events"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff']}>
              <AdminManageEventsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-messages"
          element={
            <PrivateRoute requiredRoles={['Admin']}>
              <AdminManageMessagesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/create-event"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff']}>
              <CreateEventPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-users"
          element={
            <PrivateRoute requiredRoles={['Admin']}>
              <ManageUsersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/school-settings"
          element={
            <PrivateRoute requiredRoles={['Admin']}>
              <SchoolSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/registration-management"
          element={
            <PrivateRoute requiredRoles={['Admin']}>
              <RegistrationManagementPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/staff-approvals"
          element={
            <PrivateRoute requiredRoles={['Admin']}>
              <StaffApprovalPage />
            </PrivateRoute>
          }
        />

        {/* Staff routes */}
        <Route
          path="/staff/dashboard"
          element={
            <PrivateRoute requiredRoles={['Staff']}>
              <StaffDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/attendance"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff']}>
              <EventAttendancePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/create-event"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff']}>
              <CreateEventPage />
            </PrivateRoute>
          }
        />

        {/* Shared Admin/Staff routes */}
        <Route
          path="/analytics"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff']}>
              <AnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/students-40-hours"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff']}>
              <Students40HoursPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/students-by-year"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff']}>
              <StudentsByYearPage />
            </PrivateRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute requiredRoles={['Student']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-participation"
          element={
            <PrivateRoute requiredRoles={['Student']}>
              <MyParticipationPage />
            </PrivateRoute>
          }
        />

        {/* User account pages */}
        <Route
          path="/profile"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff', 'Student']}>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff', 'Student']}>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PrivateRoute requiredRoles={['Admin', 'Staff', 'Student']}>
              <ChangePasswordPage />
            </PrivateRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;