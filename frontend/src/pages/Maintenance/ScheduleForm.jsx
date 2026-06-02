/**
 * Maintenance schedule form page.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEquipmentList } from '../../hooks/useEquipment';
import { useCreateMaintenance } from '../../hooks/useMaintenance';

const MAINTENANCE_TYPES = ['Preventive', 'Predictive', 'Corrective', 'Emergency', 'Inspection'];
const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export function ScheduleForm() {
  const navigate = useNavigate();
  const equipmentQuery = useEquipmentList({ skip: 0, limit: 200 });
  const createMaintenance = useCreateMaintenance();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      equipment_id: '',
      maintenance_type: 'Preventive',
      priority_level: 'Low',
      scheduled_date: new Date().toISOString().slice(0, 10),
      assigned_mechanic_id: '',
      cost_estimate: '',
      notes: '',
    },
  });

  const onSubmit = async (values) => {
    const payload = {
      equipment_id: Number(values.equipment_id),
      maintenance_type: values.maintenance_type,
      priority_level: values.priority_level,
      scheduled_date: values.scheduled_date,
      assigned_mechanic_id: values.assigned_mechanic_id ? Number(values.assigned_mechanic_id) : undefined,
      cost_estimate: values.cost_estimate ? Number(values.cost_estimate) : undefined,
      notes: values.notes || undefined,
    };

    try {
      await createMaintenance.mutateAsync(payload);
      navigate('/maintenance');
    } catch (error) {
      alert(error.response?.data?.detail || error.message || 'Unable to create schedule');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Schedule Maintenance</h1>
          <p className="text-gray-600 mt-2">Create a new maintenance schedule for equipment.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Equipment</span>
                <select
                  {...register('equipment_id', { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select equipment</option>
                  {equipmentQuery.data?.map((item) => (
                    <option key={item.equipment_id} value={item.equipment_id}>
                      {item.equipment_code} - {item.equipment_name}
                    </option>
                  ))}
                </select>
                {errors.equipment_id && <p className="text-red-600 text-sm">Equipment is required.</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Scheduled Date</span>
                <input
                  type="date"
                  {...register('scheduled_date', { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.scheduled_date && <p className="text-red-600 text-sm">Scheduled date is required.</p>}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Maintenance Type</span>
                <select
                  {...register('maintenance_type', { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {MAINTENANCE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Priority</span>
                <select
                  {...register('priority_level', { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {PRIORITY_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Mechanic Staff ID</span>
                <input
                  type="number"
                  {...register('assigned_mechanic_id')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Estimated Cost</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('cost_estimate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Notes</span>
              <textarea
                rows="4"
                {...register('notes')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Maintenance instructions or comments"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/maintenance')}
                className="inline-flex items-center justify-center px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || createMaintenance.isLoading}
                className="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {createMaintenance.isLoading ? 'Saving...' : 'Create Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
