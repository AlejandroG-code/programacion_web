'use client';

import React from 'react';
import * as Icons from 'lucide-react';

export type IconName = keyof typeof Icons;

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 18, className = '' }) => {
  // Convertir kebab-case o lowercase a PascalCase si es necesario
  const pascalName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const Component = (Icons as any)[pascalName] || (Icons as any)[name] || Icons.HelpCircle;

  return <Component size={size} className={className} />;
};
