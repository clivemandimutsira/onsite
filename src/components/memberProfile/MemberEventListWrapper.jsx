// src/components/member/MemberEventListWrapper.jsx
import React, { useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import MemberEventList from '../memberProfile/tabs/MemberEventList';

export default function MemberEventListWrapper() {
  const { memberId: routeMemberId } = useParams();
  const { memberId: loggedInMemberId, userRole } = useContext(AuthContext);

  if (userRole !== 'member') {
    return <Navigate to="/" replace />;
  }

  if (routeMemberId !== loggedInMemberId) {
    return <Navigate to={`/members/profile/${loggedInMemberId}`} replace />;
  }

  return <MemberEventList memberId={loggedInMemberId} />;
}
