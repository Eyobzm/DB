/**
 * Maintenance schedule list page with filters and calendar view.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { useMaintenanceList } from '../../hooks/useMaintenance';
import { MaintenanceCalendar } from './MaintenanceCalendar';

const PRIORITY_BADGES = {
  Critical: 'bg-red-100 text-red-800',
  High: 'bg-amber-100 text-amber-800',
  Medium: 'bg-blue-100 text-blue-800',
  Low: 'bg-gray-100 text-gray-800',
};

const STATUS_BADGES = {
  Scheduled: 'bg-indigo-100 text-indigo-800',
  In_Progress: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-800',
  Overdue: 'bg-red-100 text-red-800',
};

export function MaintenanceList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [equipmentId, setEquipmentId] = useState('');
  const [status, setStatus] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('');

  const queryFilters = useMemo(() => {
    const payload = {};
    if (equipmentId) payload.equipment_id = Number(equipmentId);
    if (status) payload.status = status;
    if (priorityLevel) payload.priority_level = priorityLevel;
    return payload;
  }, [equipmentId, status, priorityLevel]);

  const maintenanceQuery = useMaintenanceList(filters);

  const columns = [
    {
      accessorKey: 'schedule_number',
      header: 'Schedule #',
    },
    {
      accessorKey: 'maintenance_type',
      header: 'Type',
    },
    {
      accessorKey: 'scheduled_date',
      header: 'Scheduled Date',
    },
    {
      accessorKey: 'priority_level',
      header: 'Priority',
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_BADGES[info.getValue()]}`}>
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'equipment_id',
      header: 'Equipment ID',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_BADGES[info.getValue()]}`}>
          {info.getValue().replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'cost_estimate',
      header: 'Estimate',
      cell: (info) => `$${info.getValue()?.toFixed(2) || '0.00'}`,
    },
  ];

  const table = useReactTable({
    data: maintenanceQuery.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setFilters(queryFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Scheduling</h1>
            <p className="text-gray-600 mt-1">Manage scheduled maintenance, costs, and overdue work.</p>
          </div>
          <button
            onClick={() => navigate('/maintenance/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            + New Schedule
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid gap-6">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white rounded-lg shadow p-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Equipment ID</span>
            <input
              type="number"
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter ID"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In_Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Overdue">Overdue</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Priority</span>
            <select
              value={priorityLevel}
              onChange={(e) => setPriorityLevel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessorKey || column.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maintenanceQuery.isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-sm text-gray-500">
                    Loading maintenance schedules...
                  </td>
                </tr>
              ) : maintenanceQuery.data?.length ? (
                maintenanceQuery.data.map((item) => (
                  <tr key={item.maintenance_schedule_id} className={item.status === 'Overdue' ? 'bg-red-50' : ''}>
                    {columns.map((column) => (
                      <td key={column.accessorKey || column.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.cell ? column.cell({ getValue: () => item[column.accessorKey] }) : item[column.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-sm text-gray-500">
                    No maintenance schedules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <MaintenanceCalendar schedules={maintenanceQuery.data || []} />
      </div>
    </div>
  );
}
