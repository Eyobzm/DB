/**
 * TopBar - Top navigation bar with user info and sidebar toggle
 */

import React from 'react';
import { Menu, User } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

export function TopBar({ onSidebarToggle, sidebarOpen }) {
  const { user } = useAuthContext();

  // Map role to badge color
  const roleBadgeColor = {
    Admin: 'bg-red-100 text-red-800',
    Accountant: 'bg-green-100 text-green-800',
    Site_Manager: 'bg-blue-100 text-blue-800',
    Operator: 'bg-yellow-100 text-yellow-800',
    Supervisor: 'bg-purple-100 text-purple-800',
  };

  const badge = roleBadgeColor[user?.role] || 'bg-gray-100 text-gray-800';

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      {/* Left: Sidebar toggle + title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onSidebarToggle}
          className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:block">
          <h2 className="text-sm font-semibold text-gray-900">
            CFMS - Fleet Management System
          </h2>
        </div>
      </div>

      {/* Right: User info */}
      {user && (
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${badge}`}>
              {user.role}
            </span>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
        </div>
      )}
    </div>
  );
}
