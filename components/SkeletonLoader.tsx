import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
      role="status"
      aria-label="loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SkeletonLoader;