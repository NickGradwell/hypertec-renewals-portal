import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <div className="text-lg text-gray-600">Loading Application...</div>
        <div className="text-sm text-gray-500 mt-2">Please wait while we initialize</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
