// src/routes/AppRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

import Login from '../pages/Login';
import Register from '../pages/Register';
import RequestReset from '../pages/RequestReset';
import ResetPassword from '../pages/ResetPassword';
import Dashboard from '../pages/Dashboard';
import MemberPage from '../pages/MemberPage';
import PrayerRequestPage from '../pages/PrayerRequestPage';
import FirstTimersAndNewConvertsPage from '../pages/FirstTimersAndNewConvertsPage';
import MemberInteractionPage from '../pages/MemberInteractionPage';
import MemberUserProfileWrapper from '../components/memberProfile/MemberUserProfileWrapper';
import MemberDashboard from '../pages/MemberDashboard';
import SettingsPage from '../pages/SettingsPage';

import EventsList from '../components/events/EventsList';
import EventForm from '../components/events/EventForm';
import EventDetail from '../pages/EventDetail';

import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import GroupsAndDepartmentsPage from '../components/GroupsAndDepartmentsPage'; // Import the new wrapper component
import FinanceAccountsPage from '../components/FinanceAccountsPage';
function RoleBasedRedirect() {
  const { userRole } = useContext(AuthContext);
  if (userRole === 'member') {
    return <Navigate to="/member-dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/request-reset" element={<RequestReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Only Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/new" element={<EventForm />} />
          <Route path="/events/:id/edit" element={<EventForm />} />
         <Route path="/finance" element={<FinanceAccountsPage />} />
        </Route>
      </Route>

      {/* Member Self-Only Profile Route */}
      <Route element={<ProtectedRoute allowedRoles={['member']} allowSelfOnly={true} />}>
        <Route element={<MainLayout />}>
          <Route path="/members/profile/:memberId" element={<MemberUserProfileWrapper />} />
        </Route>
      </Route>

      {/* Member Dashboard Route */}
      <Route element={<ProtectedRoute allowedRoles={['member']} />}>
        <Route element={<MainLayout />}>
          <Route path="/member-dashboard" element={<MemberDashboard />} />
        </Route>
      </Route>

      {/* All Authenticated Users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<MemberPage />} />
          <Route path="/groups-departments" element={<GroupsAndDepartmentsPage />} /> {/* New route */}
          <Route path="/members/:id/prayer-requests" element={<PrayerRequestPage />} />
          <Route path="/members/:id/interactions" element={<MemberInteractionPage />} />
          <Route path="/first-timers-converts" element={<FirstTimersAndNewConvertsPage />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/" element={<RoleBasedRedirect />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for doesn't exist.</p>
          </div>
        }
      />
    </Routes>
  );
}
