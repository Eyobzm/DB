/**
 * Equipment list page with TanStack Table, filtering, and pagination
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { useEquipmentList } from '../../hooks/useEquipment';

const EQUIPMENT_STATUSES = [
  'Available',
  'In_Use',
  'Under_Maintenance',
  'Rented_Out',
  'Retired',
  'Stored',
];

const EQUIPMENT_CATEGORIES = [
  'Truck',
  'Excavator',
  'Loader',
  'Bulldozer',
  'Grader',
  'Backhoe',
  'Crane',
  'Forklift',
];

const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-800',
  In_Use: 'bg-blue-100 text-blue-800',
  Under_Maintenance: 'bg-amber-100 text-amber-800',
  Retired: 'bg-gray-100 text-gray-800',
  Rented_Out: 'bg-purple-100 text-purple-800',
  Stored: 'bg-slate-100 text-slate-800',
};

export function EquipmentList() {
  const navigate = useNavigate();
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [siteIdFilter, setSiteIdFilter] = useState('');

  const { data: equipment = [], isLoading, isError, error } = useEquipmentList({
    skip,
    limit,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    siteId: siteIdFilter ? parseInt(siteIdFilter) : undefined,
  });

  const columns = [
    {
      accessorKey: 'equipment_code',
      header: 'Equipment Code',
      cell: (info) => (
        <button
          onClick={() => navigate(`/equipment/${info.row.original.equipment_id}`)}
          className="text-blue-600 hover:underline"
        >
          {info.getValue()}
        </button>
      ),
    },
    {
      accessorKey: 'equipment_name',
      header: 'Name',
    },
    {
      accessorKey: 'equipment_category',
      header: 'Category',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => (
        <span className={`px-2 py-1 rounded text-sm font-medium ${STATUS_COLORS[info.getValue()]}`}>
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'manufacturer',
      header: 'Manufacturer',
    },
    {
      accessorKey: 'model_year',
      header: 'Year',
    },
    {
      accessorKey: 'acquisition_cost',
      header: 'Acquisition Cost',
      cell: (info) => `$${info.getValue()?.toFixed(2) || 'N/A'}`,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/equipment/${info.row.original.equipment_id}`)}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </button>
          <button
            onClick={() => navigate(`/equipment/${info.row.original.equipment_id}/edit`)}
            className="text-green-600 hover:text-green-800"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: equipment,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: skip / limit,
        pageSize: limit,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading equipment...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        <p>Error loading equipment: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
            <button
              onClick={() => navigate('/equipment/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              + New Equipment
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setSkip(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {EQUIPMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSkip(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {EQUIPMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Site Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site ID</label>
              <input
                type="number"
                value={siteIdFilter}
                onChange={(e) => {
                  setSiteIdFilter(e.target.value);
                  setSkip(0);
                }}
                placeholder="Enter site ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : header.getContext().header.column.columnDef.header}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    No equipment found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cell.getContext().renderCell?.()}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setSkip(skip + limit)}
                disabled={equipment.length < limit}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{skip + 1}</span> to{' '}
                  <span className="font-medium">{skip + equipment.length}</span> results
                </p>
              </div>
              <div>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setSkip(0);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
