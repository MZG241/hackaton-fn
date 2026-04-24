'use client';

import React from 'react';

interface CustomIconProps {
  name: string;
  size?: number | string;
  className?: string;
  color?: string;
}

/**
 * CustomIcon component to display Vuesax icons from the public directory.
 * Usage: <CustomIcon name="profile-2user" size={24} className="text-primary" />
 */
const CustomIcon: React.FC<CustomIconProps> = ({ 
  name, 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  const iconName = name.endsWith('.svg') ? name : `${name}.svg`;
  const iconPath = `/icons/vuesax/${iconName}`;

  return (
    <span 
      className={`inline-block ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: color === 'currentColor' ? undefined : color,
        maskImage: `url(${iconPath})`,
        WebkitMaskImage: `url(${iconPath})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        background: color === 'currentColor' ? 'currentColor' : undefined
      }}
    />
  );
};

export default CustomIcon;
