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
      <path
        d="M32 14.5C34.1 24.7 39.3 29.9 49.5 32C39.3 34.1 34.1 39.3 32 49.5C29.9 39.3 24.7 34.1 14.5 32C24.7 29.9 29.9 24.7 32 14.5Z"
        fill="currentColor"
      />
      <path
        d="M18.75 41.5C21.45 47.85 27.75 52.3 35.1 52.3C43.5 52.3 50.62 46.47 52.28 38.48"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="18.75" cy="41.5" r="3.6" fill="currentColor" />
      <circle cx="52.3" cy="38.4" r="2.45" fill="currentColor" fillOpacity="0.72" />
    </svg>
  );
}
