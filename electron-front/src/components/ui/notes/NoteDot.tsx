
import React from 'react';

interface NoteDotProps {
  color?: string;
}

const NoteDot: React.FC<NoteDotProps> = ({ color = '#3498db' }) => {
  return (
    <div 
      className="note-dot inline-block m-0.5"
      style={{ backgroundColor: color }}
    />
  );
};

export default NoteDot;
