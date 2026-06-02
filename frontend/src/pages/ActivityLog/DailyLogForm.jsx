/**
 * Activity Log form for daily equipment usage entry.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '../../context/AuthContext';
import { useEquipmentList } from '../../hooks/useEquipment';
import { useCreateActivityLog } from '../../hooks/useActivityLog';

export function DailyLogForm() {
  const { user } = useAuthContext();
  const equipmentQuery = useEquipmentList({ skip: 0, limit: 200 });
  const createActivityLog = useCreateActivityLog();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      activity_date: new Date().toISOString().slice(0, 10),
      activity_type: '',
      equipment_id: '',
      assistant_id: '',
      hours_used: '',
      engine_hours_start: '',
      engine_hours_end: '',
      odometer_start: '',
      odometer_end: '',
      fuel_consumed: '',
      material_type: '',
      description: '',
    },
  });

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      equipment_id: Number(values.equipment_id),
      assistant_id: values.assistant_id ? Number(values.assistant_id) : undefined,
      hours_used: values.hours_used ? Number(values.hours_used) : undefined,
      engine_hours_start: values.engine_hours_start ? Number(values.engine_hours_start) : undefined,
      engine_hours_end: values.engine_hours_end ? Number(values.engine_hours_end) : undefined,
      odometer_start: values.odometer_start ? Number(values.odometer_start) : undefined,
      odometer_end: values.odometer_end ? Number(values.odometer_end) : undefined,
      fuel_consumed: values.fuel_consumed ? Number(values.fuel_consumed) : undefined,
      material_type: values.material_type || undefined,
      description: values.description || undefined,
    };

    try {
      await createActivityLog.mutateAsync(payload);
      reset();
      alert('Activity log created successfully');
    } catch (error) {
      alert(error.response?.data?.detail || error.message || 'Unable to create activity log');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Daily Activity Log</h2>
          <p className="text-sm text-gray-600 mt-1">
            Created by: {user?.first_name} {user?.last_name} ({user?.role})
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Activity Date</span>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('activity_date', { required: true })}
              />
              {errors.activity_date && <span className="text-sm text-red-600">Required</span>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Equipment</span>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('equipment_id', { required: true })}
              >
                <option value="">Select equipment</option>
                {equipmentQuery.data?.map((equip) => (
                  <option key={equip.equipment_id} value={equip.equipment_id}>
                    {equip.equipment_code} - {equip.equipment_name}
                  </option>
                ))}
              </select>
              {errors.equipment_id && <span className="text-sm text-red-600">Required</span>}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Activity Type</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('activity_type')}
                placeholder="e.g. Transport, Loading"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Assistant Staff ID</span>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('assistant_id')}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Engine Hours Start</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('engine_hours_start')}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Engine Hours End</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('engine_hours_end')}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Odometer Start</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('odometer_start')}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Odometer End</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('odometer_end')}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Fuel Consumed (L)</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('fuel_consumed')}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Material Type</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                {...register('material_type')}
                placeholder="e.g. Gravel, Sand"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <textarea
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              {...register('description')}
              placeholder="Notes about the activity"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || createActivityLog.isLoading}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {createActivityLog.isLoading ? 'Saving...' : 'Save Activity Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
