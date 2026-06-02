/**
 * Equipment form component with react-hook-form + Zod validation
 */

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEquipmentDetail, useCreateEquipment, useUpdateEquipment } from '../../hooks/useEquipment';

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

// Zod validation schema
const equipmentSchema = z.object({
  equipment_code: z.string().min(1, 'Equipment code is required').max(50),
  equipment_name: z.string().min(1, 'Equipment name is required').max(255),
  equipment_category: z.enum(EQUIPMENT_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid equipment category' }),
  }),
  manufacturer: z.string().optional(),
  model_year: z.coerce.number().int().optional().nullable(),
  serial_number: z.string().optional(),
  vendor_id: z.coerce.number().int().optional().nullable(),
  acquisition_cost: z.coerce.number().positive().optional().nullable(),
  acquisition_date: z.string().optional(),
  useful_life_years: z.coerce.number().int().positive().optional().nullable(),
  salvage_value: z.coerce.number().positive().optional().nullable(),
  current_site: z.coerce.number().int().optional().nullable(),
  operator_id: z.coerce.number().int().optional().nullable(),
});

export function EquipmentForm() {
  const navigate = useNavigate();
  const { id: equipmentId } = useParams();
  const isEditMode = !!equipmentId;

  const { data: existingEquipment, isLoading: isLoadingDetail } = useEquipmentDetail(
    equipmentId ? parseInt(equipmentId) : null
  );

  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(equipmentSchema),
    defaultValues: isEditMode ? existingEquipment : undefined,
  });

  // Update form when equipment detail loads
  useEffect(() => {
    if (existingEquipment) {
      reset(existingEquipment);
    }
  }, [existingEquipment, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: parseInt(equipmentId), ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate('/equipment');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (isEditMode && isLoadingDetail) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading equipment...</div>
      </div>
    );
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;
  const hasErrors = createMutation.isError || updateMutation.isError;
  const errorMessage = (createMutation.error || updateMutation.error)?.message;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Equipment' : 'New Equipment'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          {hasErrors && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Equipment Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Code *
              </label>
              <input
                {...register('equipment_code')}
                type="text"
                disabled={isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              {errors.equipment_code && (
                <p className="text-red-600 text-sm mt-1">{errors.equipment_code.message}</p>
              )}
            </div>

            {/* Equipment Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Name *
              </label>
              <input
                {...register('equipment_name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.equipment_name && (
                <p className="text-red-600 text-sm mt-1">{errors.equipment_name.message}</p>
              )}
            </div>

            {/* Equipment Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register('equipment_category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.equipment_category && (
                <p className="text-red-600 text-sm mt-1">{errors.equipment_category.message}</p>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <input
                  {...register('manufacturer')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Model Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Year
                </label>
                <input
                  {...register('model_year')}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number
                </label>
                <input
                  {...register('serial_number')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Vendor ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor ID
                </label>
                <input
                  {...register('vendor_id')}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Acquisition Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acquisition Cost
                </label>
                <input
                  {...register('acquisition_cost')}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Acquisition Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acquisition Date
                </label>
                <input
                  {...register('acquisition_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Useful Life Years */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Useful Life (Years)
                </label>
                <input
                  {...register('useful_life_years')}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Salvage Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salvage Value
                </label>
                <input
                  {...register('salvage_value')}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Current Site */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Site ID
                </label>
                <input
                  {...register('current_site')}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Operator ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operator ID
                </label>
                <input
                  {...register('operator_id')}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/equipment')}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
