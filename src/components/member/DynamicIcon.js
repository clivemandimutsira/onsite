import React from 'react';
import {
  Award,
  Star,
  Crown,
  Users,
  Heart,
  Bell,
  Camera,
  MessageSquare,
} from 'lucide-react';

const iconMap = {
  award: Award,
  star: Star,
  crown: Crown,
  users: Users,
  heart: Heart,
  bell: Bell,
  camera: Camera,
  message: MessageSquare,
};

const normalizeIconName = (name) => name?.toLowerCase().trim() || 'award';

const DynamicIcon = ({ iconName, size = 24, color = '#000' }) => {
  const key = normalizeIconName(iconName);
  const Icon = iconMap[key];

  if (!Icon) {
    console.warn(`Unknown icon: "${iconName}". Using default.`);
    return <Award size={size} color={color} />;
  }

  return <Icon size={size} color={color} />;
};

export default DynamicIcon;
