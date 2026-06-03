import React from 'react';
import { PageHeader, DataTable, LoadingSpinner } from '../../components/ui';
import { useSiteList } from '../../hooks/useSites';

const statusStyles = {
  Active: 'bg-green-100 text-green-800',
  Completed: 'bg-blue-100 text-blue-800',
  On_Hold: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
  Planning: 'bg-indigo-100 text-indigo-800',
};

export default function SiteList() {
  const { data = [], isLoading } = useSiteList();

  const columns = [
    { accessorKey: 'site_code', header: 'Site Code' },
    { accessorKey: 'site_name', header: 'Site Name' },
    { accessorKey: 'city', header: 'City' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[value] ?? 'bg-gray-100 text-gray-700'}`}>
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? `ETB ${Number(value).toLocaleString()}` : 'N/A';
      },
    },
    { accessorKey: 'site_manager', header: 'Site Manager' },
  ];

  if (isLoading) return <LoadingSpinner message="Loading sites..." />;

  return (
    <div>
      <PageHeader title="Sites" subtitle="Project sites and current budget status" />
      <DataTable columns={columns} data={data} noDataMessage="No sites found" />
    </div>
  );
}
