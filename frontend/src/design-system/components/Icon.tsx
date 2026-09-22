import React from 'react';
import { cn } from '@/utils/cn';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ size = 24, className, children, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("inline-block", className)}
    {...props}
  >
    {children}
  </svg>
);
