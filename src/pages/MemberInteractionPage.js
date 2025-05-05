// src/pages/MemberInteractionPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import MemberInteractionPage from '../components/MemberInteractionPage';

const MemberInteractionRoutePage = () => {
  const { id } = useParams();

  return <MemberInteractionPage memberId={id} />;
};

export default MemberInteractionRoutePage;
