// MemberUserProfileWrapper.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import MemberUserProfile from './MemberUserProfile';

const MemberUserProfileWrapper = () => {
  const { memberId } = useParams();
  return <MemberUserProfile memberId={memberId} />;
};

export default MemberUserProfileWrapper;
