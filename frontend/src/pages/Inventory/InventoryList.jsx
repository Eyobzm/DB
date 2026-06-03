import React from 'react';
import { useInventoryList } from '../../hooks/useInventory';
import { PageHeader, DataTable, LoadingSpinner } from '../../components/ui';

export default function InventoryList() {
  const { data = [], isLoading } = useInventoryList();

  const columns = [
    { accessorKey: 'part_number', header: 'Part Number' },
    { accessorKey: 'part_name', header: 'Part Name' },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'current_stock',
      header: 'Current Stock',
    },
    {
      accessorKey: 'minimum_level',
      header: 'Minimum Level',
    },
    {
      accessorKey: 'unit_price',
      header: 'Unit Price',
      cell: (info) => (info.getValue() != null ? `$${info.getValue().toFixed(2)}` : 'N/A'),
    },
    {
      accessorKey: 'stock_status',
      header: 'Stock Status',
      cell: (info) => {
        const row = info.row.original;
        const current = row.current_stock ?? 0;
        const minimum = row.minimum_level ?? 0;
        const isHealthy = current > minimum;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isHealthy ? 'Healthy' : 'Low Stock'}
          </span>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner message="Loading inventory..." />;

  return (
    <div>
      <PageHeader title="Inventory" actionLabel="Add Item" />
      <DataTable columns={columns} data={data} noDataMessage="No inventory items" />
    </div>
  );
}
