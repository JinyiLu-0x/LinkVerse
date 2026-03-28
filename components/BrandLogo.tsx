import React from 'react';

type BrandLogoProps = React.SVGProps<SVGSVGElement>;

export default function BrandLogo({ className, ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Outer subtle ring */}
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" />
      
      {/* Node connections */}
      <path 
        d="M22 26L42 20L36 44Z" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
        fill="currentColor" 
        fillOpacity="0.1" 
      />
      
      {/* Nodes */}
      <circle cx="22" cy="26" r="5" fill="currentColor" />
      <circle cx="42" cy="20" r="4" fill="currentColor" fillOpacity="0.8" />
      <circle cx="36" cy="44" r="6" fill="currentColor" fillOpacity="0.9" />
      
      {/* Accent dot */}
      <circle cx="46" cy="38" r="2" fill="currentColor" fillOpacity="0.4" />
      <path d="M36 44L46 38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.4" />
    </svg>
  );
}
