import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles = [], allowSelfOnly = false }) {
  const { isAuthenticated, userRole, user } = useContext(AuthContext);
  const params = useParams();
  const location = useLocation();

  // Redirect to login if the user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>403 - Unauthorized</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // Self-access check for /members/profile/:memberId
  if (allowSelfOnly && userRole === 'member') {
    const profileId = params.memberId || location.pathname.split('/').pop();
    console.log('ProtectedRoute:', {
      userRole,
      userMemberId: user?.memberId,
      paramsMemberId: params.memberId,
      profileId,
    });

    if (!user || String(user.memberId) !== String(profileId)) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>403 - Forbidden</h2>
          <p>You can only view your own profile.</p>
        </div>
      );
    }
  }

  // Render the child routes if all checks pass
  return <Outlet />;
}
