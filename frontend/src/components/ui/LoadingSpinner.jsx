/**
 * LoadingSpinner - Shown during async API calls (NFR032)
 */

import React from 'react';
import { Loader } from 'lucide-react';

export function LoadingSpinner({ fullScreen = false, message = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-12 h-12">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}
