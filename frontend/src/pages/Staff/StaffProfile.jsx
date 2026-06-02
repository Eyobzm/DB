import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaffDetail } from '../../hooks/useStaff';
import { PageHeader, LoadingSpinner } from '../../components/ui';

export default function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useStaffDetail(id);

  if (isLoading) return <LoadingSpinner message="Loading staff..." />;
  if (!data) return <div>Staff not found</div>;

  return (
    <div>
      <PageHeader title={`${data.first_name} ${data.last_name}`} action={() => navigate(`/staff/${id}/edit`)} actionLabel="Edit" />
      <div className="bg-white p-6 rounded shadow">
        <p><strong>Employee #:</strong> {data.employee_number}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Role:</strong> {data.role}</p>
        <p><strong>Status:</strong> {data.status}</p>
      </div>
    </div>
  );
}
