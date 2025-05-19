// src/components/member/MemberFinancePageWrapper.jsx
import React, { useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MemberFinancePage from '../member/MemberFinancePage';
import { AuthContext } from '../../contexts/AuthContext';

export default function MemberFinancePageWrapper() {
  const { memberId: routeMemberId } = useParams();
  const { memberId: loggedInMemberId, userRole } = useContext(AuthContext);

  if (userRole !== 'member') {
    return <Navigate to="/" replace />;
  }

  if (routeMemberId !== loggedInMemberId) {
    return <Navigate to={`/members/profile/${loggedInMemberId}`} replace />;
  }

  return <MemberFinancePage memberId={loggedInMemberId} />;
}
