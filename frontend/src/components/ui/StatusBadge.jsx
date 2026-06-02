/**
 * StatusBadge - Color-coded pill for status and priority values
 */

import React from 'react';

// Status mappings for equipment and general statuses
const STATUS_COLORS = {
  // Equipment statuses
  Available: 'bg-green-100 text-green-800',
  In_Use: 'bg-blue-100 text-blue-800',
  Under_Maintenance: 'bg-orange-100 text-orange-800',
  Rented_Out: 'bg-purple-100 text-purple-800',
  Retired: 'bg-gray-100 text-gray-800',
  
  // Maintenance statuses
  Scheduled: 'bg-blue-100 text-blue-800',
  In_Progress: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Overdue: 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-800',
  
  // Activity log statuses
  Pending: 'bg-yellow-100 text-yellow-800',
  Verified: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  
  // Finance statuses
  Draft: 'bg-slate-100 text-slate-800',
  Pending_Approval: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Paid: 'bg-green-100 text-green-800',
  Unpaid: 'bg-orange-100 text-orange-800',
  Disbursed: 'bg-green-100 text-green-800',
  
  // Priority levels
  Critical: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-blue-100 text-blue-800',
  Low: 'bg-green-100 text-green-800',
  
  // Site statuses
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Closed: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status, priority = false, className = '' }) {
  // Handle null/undefined status
  if (!status) {
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 ${className}`}>
        Unknown
      </span>
    );
  }

  // Normalize status string (handle both snake_case and spaces)
  const normalizedStatus = String(status).trim().replace(/\s+/g, '_');
  
  // Get color for this status
  const color = STATUS_COLORS[normalizedStatus] || 'bg-gray-100 text-gray-800';
  
  // Format display text (snake_case to Title Case)
  const displayText = normalizedStatus
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${color} ${className}`}>
      {displayText}
    </span>
  );
}
