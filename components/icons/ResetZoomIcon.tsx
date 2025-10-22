import React from 'react';

export const ResetZoomIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M5 9a7 7 0 0112.24-4.24M20 20v-5h-5M19 15a7 7 0 01-12.24 4.24" />
    </svg>
);