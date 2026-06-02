/**
 * Activity Log list page with filters and verify actions.
 */

import React, { useState, useMemo } from 'react';
import { useActivityLogList, useVerifyActivityLog } from '../../hooks/useActivityLog';
import { useAuthContext } from '../../context/AuthContext';

export function ActivityLogList() {
  const { user } = useAuthContext();
  const [filters, setFilters] = useState({});
  const [searchDate, setSearchDate] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const verifyMutation = useVerifyActivityLog();

  const queryFilters = useMemo(() => {
    const payload = {};
    if (searchDate) payload.start_date = searchDate;
    if (equipmentId) payload.equipment_id = Number(equipmentId);
    if (operatorId) payload.operator_id = Number(operatorId);
    return payload;
  }, [searchDate, equipmentId, operatorId]);

  const activityQuery = useActivityLogList(filters);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setFilters(queryFilters);
  };

  const handleVerify = async (id) => {
    try {
      await verifyMutation.mutateAsync(id);
      alert('Activity log verified');
    } catch (error) {
      alert(error.response?.data?.detail || error.message || 'Unable to verify log');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Activity Logs</h2>
          <p className="text-sm text-gray-600">Review daily equipment activity and verification status.</p>
        </div>
      </div>

      <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Date</span>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Equipment ID</span>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Operator ID</span>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Txn #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
              {user?.role === 'Supervisor' && <th className="px-6 py-3" />}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activityQuery.isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-sm text-gray-500">Loading activity logs...</td>
              </tr>
            ) : activityQuery.data?.length ? (
              activityQuery.data.map((item) => (
                <tr key={item.activity_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.transaction_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.activity_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.equipment_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.operator_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                      item.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.is_verified ? 'Yes' : 'No'}</td>
                  {user?.role === 'Supervisor' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {item.is_verified ? (
                        <span className="text-gray-500">Verified</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleVerify(item.activity_id)}
                          disabled={verifyMutation.isLoading}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-sm text-gray-500">No activity logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
