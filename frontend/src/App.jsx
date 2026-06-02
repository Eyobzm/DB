/**
 * Main App component with routing
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { ProtectedRoute } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { EquipmentList } from './pages/Equipment/EquipmentList';
import { EquipmentForm } from './pages/Equipment/EquipmentForm';
import { EquipmentDetail } from './pages/Equipment/EquipmentDetail';
import { DailyLogForm } from './pages/ActivityLog/DailyLogForm';
import { ActivityLogList } from './pages/ActivityLog/ActivityLogList';
import { MaintenanceList } from './pages/Maintenance/MaintenanceList';
import { ScheduleForm } from './pages/Maintenance/ScheduleForm';
import { ClientPayments } from './pages/Finance/ClientPayments';
import { VendorPayments } from './pages/Finance/VendorPayments';
import { FundRequests } from './pages/Finance/FundRequests';
import { SiteBudget } from './pages/Finance/SiteBudget';
import { Dashboard } from './pages/Dashboard/Dashboard';
import StaffDirectory from './pages/Staff/StaffDirectory';
import StaffProfile from './pages/Staff/StaffProfile';
import InventoryList from './pages/Inventory/InventoryList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

/**
 * Dashboard placeholder navigation
 */
function DashboardNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CFMS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.first_name} {user?.last_name}</span>
              <button
                onClick={() => logout()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/equipment')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Equipment Management</h3>
              <p className="text-gray-600 mt-2">View and manage fleet equipment</p>
            </button>
            <button
              onClick={() => navigate('/activity-logs')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
              <p className="text-gray-600 mt-2">Review completed activity logs</p>
            </button>
            <button
              onClick={() => navigate('/activity-logs/new')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Daily Log Entry</h3>
              <p className="text-gray-600 mt-2">Submit equipment daily activity</p>
            </button>
            <button
              onClick={() => navigate('/maintenance')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Scheduling</h3>
              <p className="text-gray-600 mt-2">View and manage maintenance schedules</p>
            </button>
            <button
              onClick={() => navigate('/maintenance/new')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">New Maintenance</h3>
              <p className="text-gray-600 mt-2">Create a maintenance schedule</p>
            </button>
            <button
              onClick={() => navigate('/finance/client-payments')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Client Payments</h3>
              <p className="text-gray-600 mt-2">Record and review incoming client receipts</p>
            </button>
            <button
              onClick={() => navigate('/finance/vendor-payments')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Vendor Payments</h3>
              <p className="text-gray-600 mt-2">Manage vendor invoice payments and balances</p>
            </button>
            <button
              onClick={() => navigate('/finance/fund-requests')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Fund Requests</h3>
              <p className="text-gray-600 mt-2">Submit and approve operational fund requests</p>
            </button>
            <button
              onClick={() => navigate('/finance/site-budget')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Site Budgets</h3>
              <p className="text-gray-600 mt-2">Track budget allocations and remaining balances</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment"
        element={
          <ProtectedRoute>
            <EquipmentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/new"
        element={
          <ProtectedRoute>
            <EquipmentForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/:id/edit"
        element={
          <ProtectedRoute>
            <EquipmentForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/:id"
        element={
          <ProtectedRoute>
            <EquipmentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity-logs"
        element={
          <ProtectedRoute>
            <ActivityLogList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity-logs/new"
        element={
          <ProtectedRoute>
            <DailyLogForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <MaintenanceList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance/new"
        element={
          <ProtectedRoute>
            <ScheduleForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/client-payments"
        element={
          <ProtectedRoute>
            <ClientPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/vendor-payments"
        element={
          <ProtectedRoute>
            <VendorPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/fund-requests"
        element={
          <ProtectedRoute>
            <FundRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/site-budget"
        element={
          <ProtectedRoute>
            <SiteBudget />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <StaffDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/:id"
        element={
          <ProtectedRoute>
            <StaffProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryList />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
