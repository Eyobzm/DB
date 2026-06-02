/**
 * Sidebar - Main navigation menu with icons
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  MapPin,
  Users,
  Briefcase,
  Activity,
  DollarSign,
  Truck,
  Package,
  LogOut,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Wrench, label: 'Equipment', path: '/equipment' },
  { icon: MapPin, label: 'Sites', path: '/sites' },
  { icon: Users, label: 'Staff', path: '/staff' },
  { icon: Briefcase, label: 'Maintenance', path: '/maintenance' },
  { icon: Activity, label: 'Activity Logs', path: '/activity-logs' },
  { icon: DollarSign, label: 'Finance', path: '/finance/client-payments' },
  { icon: Truck, label: 'Vendors', path: '/vendors' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthContext();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo section */}
      <div className="px-6 py-4 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white">CFMS</h1>
        <p className="text-xs text-slate-400 mt-1">Fleet Management</p>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout button */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-900 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
