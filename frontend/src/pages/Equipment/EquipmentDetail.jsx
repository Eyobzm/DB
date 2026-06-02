/**
 * Equipment detail page with tabs for insurance and attachments
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEquipmentDetail, useEquipmentInsurance, useEquipmentAttachments } from '../../hooks/useEquipment';

const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-800',
  In_Use: 'bg-blue-100 text-blue-800',
  Under_Maintenance: 'bg-amber-100 text-amber-800',
  Retired: 'bg-gray-100 text-gray-800',
  Rented_Out: 'bg-purple-100 text-purple-800',
  Stored: 'bg-slate-100 text-slate-800',
};

export function EquipmentDetail() {
  const navigate = useNavigate();
  const { id: equipmentId } = useParams();
  const [activeTab, setActiveTab] = useState('details');

  const equipmentIdInt = equipmentId ? parseInt(equipmentId) : null;

  const { data: equipment, isLoading: isLoadingEquipment, isError: isErrorEquipment } = useEquipmentDetail(equipmentIdInt);
  const { data: insurancePolicies = [], isLoading: isLoadingInsurance } = useEquipmentInsurance(equipmentIdInt);
  const { data: attachments = [], isLoading: isLoadingAttachments } = useEquipmentAttachments(equipmentIdInt);

  if (isLoadingEquipment) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading equipment...</div>
      </div>
    );
  }

  if (isErrorEquipment) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        <p>Error loading equipment</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <p>Equipment not found</p>
        <button
          onClick={() => navigate('/equipment')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Equipment List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{equipment.equipment_name}</h1>
              <p className="text-gray-600 mt-2">
                Code: <span className="font-mono font-semibold">{equipment.equipment_code}</span>
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(`/equipment/${equipmentId}/edit`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => navigate('/equipment')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Status Badge */}
        <div className="mb-6">
          <span className={`px-4 py-2 rounded-lg text-lg font-semibold ${STATUS_COLORS[equipment.status]}`}>
            {equipment.status}
          </span>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['Details', 'Insurance', 'Attachments'].map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`flex-1 px-6 py-3 text-center font-medium ${
                    activeTab === tab.toLowerCase()
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab} {tab === 'Insurance' && `(${insurancePolicies.length})`}
                  {tab === 'Attachments' && `(${attachments.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <DetailField label="Equipment Code" value={equipment.equipment_code} />
                    <DetailField label="Name" value={equipment.equipment_name} />
                    <DetailField label="Category" value={equipment.equipment_category} />
                    <DetailField label="Manufacturer" value={equipment.manufacturer} />
                    <DetailField label="Model Year" value={equipment.model_year} />
                    <DetailField label="Serial Number" value={equipment.serial_number} />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <DetailField
                      label="Acquisition Cost"
                      value={equipment.acquisition_cost ? `$${equipment.acquisition_cost.toFixed(2)}` : 'N/A'}
                    />
                    <DetailField
                      label="Acquisition Date"
                      value={equipment.acquisition_date}
                    />
                    <DetailField label="Useful Life (Years)" value={equipment.useful_life_years} />
                    <DetailField
                      label="Salvage Value"
                      value={equipment.salvage_value ? `$${equipment.salvage_value.toFixed(2)}` : 'N/A'}
                    />
                    <DetailField label="Current Site ID" value={equipment.current_site} />
                    <DetailField label="Operator ID" value={equipment.operator_id} />
                  </div>
                </div>

                {/* Timestamps */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                    <DetailField
                      label="Created At"
                      value={new Date(equipment.created_at).toLocaleString()}
                    />
                    <DetailField
                      label="Updated At"
                      value={new Date(equipment.updated_at).toLocaleString()}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Tab */}
            {activeTab === 'insurance' && (
              <div>
                {isLoadingInsurance ? (
                  <p className="text-gray-600">Loading insurance policies...</p>
                ) : insurancePolicies.length === 0 ? (
                  <p className="text-gray-600">No insurance policies found</p>
                ) : (
                  <div className="space-y-4">
                    {insurancePolicies.map((policy) => (
                      <div key={policy.insurance_policy_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <DetailField label="Policy Number" value={policy.policy_number} />
                            <DetailField label="Provider" value={policy.insurance_provider} />
                            <DetailField
                              label="Coverage Amount"
                              value={`$${policy.coverage_amount.toFixed(2)}`}
                            />
                          </div>
                          <div>
                            <DetailField label="Premium" value={`$${policy.premium_amount?.toFixed(2) || 'N/A'}`} />
                            <DetailField label="Deductible" value={`$${policy.deductible?.toFixed(2) || 'N/A'}`} />
                            <DetailField label="Status" value={policy.status} />
                          </div>
                          <div>
                            <DetailField label="Start Date" value={policy.start_date} />
                            <DetailField label="End Date" value={policy.end_date} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => navigate(`/equipment/${equipmentId}/insurance/new`)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  + Add Insurance Policy
                </button>
              </div>
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <div>
                {isLoadingAttachments ? (
                  <p className="text-gray-600">Loading attachments...</p>
                ) : attachments.length === 0 ? (
                  <p className="text-gray-600">No attachments found</p>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.attachment_id} className="flex items-center justify-between border-b border-gray-200 py-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{attachment.file_name}</p>
                          <p className="text-sm text-gray-600">
                            {attachment.file_type} • {attachment.file_size_bytes ? `${(attachment.file_size_bytes / 1024).toFixed(2)} KB` : 'N/A'}
                          </p>
                          {attachment.description && (
                            <p className="text-sm text-gray-500 mt-1">{attachment.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500">
                            {new Date(attachment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => navigate(`/equipment/${equipmentId}/attachments/new`)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  + Upload Attachment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable detail field component
 */
function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-lg text-gray-900">{value || '—'}</p>
    </div>
  );
}
