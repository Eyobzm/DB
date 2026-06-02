import React from 'react';
import { useStaffList } from '../../hooks/useStaff';
import { PageHeader, DataTable, LoadingSpinner } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

export default function StaffDirectory() {
  const navigate = useNavigate();
  const { data = [], isLoading } = useStaffList();

  const columns = [
    { accessorKey: 'staff_id', header: 'ID' },
    { accessorKey: 'employee_number', header: 'Employee #' },
    { accessorKey: 'first_name', header: 'First' },
    { accessorKey: 'last_name', header: 'Last' },
    { accessorKey: 'role', header: 'Role' },
  ];

  if (isLoading) return <LoadingSpinner message="Loading staff..." />;

  return (
    <div>
      <PageHeader title="Staff Directory" action={() => navigate('/staff/new')} actionLabel="Add Staff" />
      <DataTable columns={columns} data={data} onRowClick={(row) => navigate(`/staff/${row.staff_id}`)} />
    </div>
  );
}
