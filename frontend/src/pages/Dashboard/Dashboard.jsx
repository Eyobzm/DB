/**
 * Dashboard page - KPIs, alerts, and trends
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardSummary, useOverdueMaintenanceList } from '../../hooks/useDashboard';

const KPI_CARDS = [
  { id: 'total', label: 'Total Equipment', key: 'total', color: 'bg-blue-500' },
  { id: 'sites', label: 'Active Sites', key: 'active_sites', color: 'bg-green-500' },
  { id: 'in_use', label: 'In Use', key: 'in_use', color: 'bg-yellow-500' },
  { id: 'maintenance', label: 'Under Maintenance', key: 'under_maintenance', color: 'bg-orange-500' },
  { id: 'overdue', label: 'Overdue Maintenance', key: 'overdue', color: 'bg-red-500' },
  { id: 'expiring', label: 'Certs Expiring (30d)', key: 'expiring_certs', color: 'bg-purple-500' },
];

function KPICard({ label, value, color, onClick, clickable = false }) {
  return (
    <div
      className={`rounded-lg shadow p-6 ${clickable ? 'cursor-pointer hover:shadow-lg transition' : ''}`}
      onClick={onClick}
    >
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <div className={`${color} text-white rounded-lg p-3 mt-3 inline-block`}>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function OverdueMaintenance() {
  const navigate = useNavigate();
  const { data: overdueList = [], isLoading } = useOverdueMaintenanceList();

  const PRIORITY_BADGES = {
    Critical: 'bg-red-100 text-red-800',
    High: 'bg-amber-100 text-amber-800',
    Medium: 'bg-blue-100 text-blue-800',
    Low: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-red-50 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Overdue Maintenance Alerts</h3>
        <button
          onClick={() => navigate('/maintenance')}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
        >
          View All →
        </button>
      </div>
      {isLoading ? (
        <p className="text-gray-600">Loading overdue maintenance...</p>
      ) : overdueList.length > 0 ? (
        <div className="space-y-3">
          {overdueList.slice(0, 5).map((maintenance) => (
            <div
              key={maintenance.maintenance_schedule_id}
              className="bg-white rounded-lg p-4 border border-red-200 cursor-pointer hover:shadow transition"
              onClick={() => navigate('/maintenance')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{maintenance.schedule_number}</p>
                  <p className="text-xs text-gray-600 mt-1">Equipment ID: {maintenance.equipment_id}</p>
                  <p className="text-xs text-gray-600">Type: {maintenance.maintenance_type}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_BADGES[maintenance.priority_level]}`}>
                    {maintenance.priority_level}
                  </span>
                  <p className="text-xs text-red-600 font-semibold mt-2">
                    Scheduled: {maintenance.scheduled_date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No overdue maintenance. All schedules on track.</p>
      )}
    </div>
  );
}

function ExpiringCertifications({ certifications = [] }) {
  return (
    <div className="bg-purple-50 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications Expiring (30 days)</h3>
      {certifications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Staff</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Certification</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certifications.map((cert, idx) => (
                <tr key={idx} className="hover:bg-purple-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{cert.staff_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{cert.cert_type}</td>
                  <td className="px-4 py-2 text-sm text-purple-600 font-semibold">{cert.expiry_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No certifications expiring in the next 30 days.</p>
      )}
    </div>
  );
}

function MonthlyTrends() {
  // Generate mock data for last 6 months
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const trendData = months.map((month, idx) => ({
    month,
    fuel_cost: Math.floor(Math.random() * 5000) + 2000,
    equipment_expense: Math.floor(Math.random() * 8000) + 3000,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends (Last 6 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="fuel_cost" fill="#8884d8" name="Fuel Cost ($)" />
          <Bar dataKey="equipment_expense" fill="#82ca9d" name="Equipment Expense ($)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Dashboard() {
  const { data: summary, isLoading } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Unable to load dashboard data</div>
      </div>
    );
  }

  const kpiValues = {
    total: summary.equipment_counts.total,
    active_sites: summary.active_sites,
    in_use: summary.equipment_counts.in_use,
    under_maintenance: summary.equipment_counts.under_maintenance,
    overdue: summary.maintenance.overdue,
    expiring_certs: summary.certifications_expiring_30d.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Fleet management overview and key performance indicators</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {KPI_CARDS.map((card) => (
            <KPICard
              key={card.id}
              label={card.label}
              value={kpiValues[card.key]}
              color={card.color}
              clickable={card.id === 'overdue'}
            />
          ))}
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <OverdueMaintenance />
          <ExpiringCertifications certifications={summary.certifications_expiring_30d} />
        </div>

        {/* Monthly Trends */}
        <MonthlyTrends />
      </div>
    </div>
  );
}
