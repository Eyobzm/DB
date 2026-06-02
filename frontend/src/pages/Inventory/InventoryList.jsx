import React from 'react';
import { useInventoryList } from '../../hooks/useInventory';
import { PageHeader, DataTable, LoadingSpinner } from '../../components/ui';

export default function InventoryList() {
  const { data = [], isLoading } = useInventoryList();

  const columns = [
    { accessorKey: 'item_id', header: 'ID' },
    { accessorKey: 'sku', header: 'SKU' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'quantity', header: 'Qty' },
  ];

  if (isLoading) return <LoadingSpinner message="Loading inventory..." />;

  return (
    <div>
      <PageHeader title="Inventory" actionLabel="Add Item" />
      <DataTable columns={columns} data={data} noDataMessage="No inventory items" />
    </div>
  );
}
