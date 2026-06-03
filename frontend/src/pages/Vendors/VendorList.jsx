import React from 'react';
import { PageHeader, DataTable, LoadingSpinner } from '../../components/ui';
import { useVendorList } from '../../hooks/useVendors';

const statusStyles = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Suspended: 'bg-yellow-100 text-yellow-800',
};

export default function VendorList() {
  const { data = [], isLoading } = useVendorList();

  const columns = [
    { accessorKey: 'vendor_name', header: 'Vendor Name' },
    { accessorKey: 'contact_person', header: 'Contact Person' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'email', header: 'Email' },
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
  ];

  if (isLoading) return <LoadingSpinner message="Loading vendors..." />;

  return (
    <div>
      <PageHeader title="Vendors" subtitle="All registered construction suppliers" />
      <DataTable columns={columns} data={data} noDataMessage="No vendors found" />
    </div>
  );
}
