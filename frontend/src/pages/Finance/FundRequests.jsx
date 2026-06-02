/**
 * Operational fund requests page
 */

import React, { useState } from 'react';
import { useOperationalFunds, useCreateOperationalFund, useUpdateOperationalFund } from '../../hooks/useFinance';
import { useAuthContext } from '../../context/AuthContext';

export function FundRequests() {
  const { user } = useAuthContext();
  const [formState, setFormState] = useState({
    fund_name: '',
    fund_category: '',
    initial_balance: '',
    current_balance: '',
    fiscal_year_start: new Date().toISOString().slice(0, 10),
    fiscal_year_end: new Date().toISOString().slice(0, 10),
    description: '',
    status: 'Draft',
  });
  const [selectedFundId, setSelectedFundId] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  const fundsQuery = useOperationalFunds();
  const createFund = useCreateOperationalFund();
  const updateFund = useUpdateOperationalFund();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = (event) => {
    event.preventDefault();
    createFund.mutate({
      ...formState,
      initial_balance: Number(formState.initial_balance),
      current_balance: formState.current_balance ? Number(formState.current_balance) : undefined,
    });
  };

  const handleStatusUpdate = (event) => {
    event.preventDefault();
    if (!selectedFundId || !statusUpdate) return;
    updateFund.mutate({ id: selectedFundId, status: statusUpdate });
  };

  const canApprove = user?.role === 'Accountant' || user?.role === 'Admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Operational Funds</h1>
          <p className="text-gray-600 mt-2">Submit funding requests and progress them through approval and disbursement.</p>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Fund Name</span>
              <input
                type="text"
                name="fund_name"
                value={formState.fund_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Fund Category</span>
              <input
                type="text"
                name="fund_category"
                value={formState.fund_category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Initial Balance</span>
              <input
                type="number"
                step="0.01"
                name="initial_balance"
                value={formState.initial_balance}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Current Balance</span>
              <input
                type="number"
                step="0.01"
                name="current_balance"
                value={formState.current_balance}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Leave blank to default to initial balance"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Fiscal Start</span>
              <input
                type="date"
                name="fiscal_year_start"
                value={formState.fiscal_year_start}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Fiscal End</span>
              <input
                type="date"
                name="fiscal_year_end"
                value={formState.fiscal_year_end}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={3}
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Submit Fund Request
              </button>
              {createFund.isLoading && <span className="ml-4 text-gray-500">Submitting...</span>}
              {createFund.isError && (
                <p className="text-red-600 mt-2">Unable to submit request. Please try again.</p>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-col md:flex-row">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Fund Requests</h2>
              <p className="text-gray-600 mt-1">Review existing operational fund requests and manage workflow transitions.</p>
            </div>
            {canApprove && (
              <form onSubmit={handleStatusUpdate} className="flex flex-col sm:flex-row items-end gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Choose Request</span>
                  <select
                    value={selectedFundId || ''}
                    onChange={(event) => setSelectedFundId(Number(event.target.value))}
                    className="mt-1 block rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select fund</option>
                    {fundsQuery.data?.map((fund) => (
                      <option key={fund.operational_fund_id} value={fund.operational_fund_id}>
                        {fund.fund_name} ({fund.status})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <select
                    value={statusUpdate}
                    onChange={(event) => setStatusUpdate(event.target.value)}
                    className="mt-1 block rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select action</option>
                    <option value="Pending_Approval">Pending Approval</option>
                    <option value="Approved">Approve</option>
                    <option value="Rejected">Reject</option>
                    <option value="Disbursed">Mark Disbursed</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Update Status
                </button>
              </form>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Name', 'Category', 'Initial', 'Current', 'Status', 'Start', 'End'].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fundsQuery.isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-sm text-gray-500">Loading fund requests...</td>
                  </tr>
                ) : fundsQuery.data?.length ? (
                  fundsQuery.data.map((fund) => (
                    <tr key={fund.operational_fund_id} className={fund.status === 'Rejected' ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 text-sm text-gray-900">{fund.operational_fund_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{fund.fund_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{fund.fund_category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${fund.initial_balance.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${fund.current_balance.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{fund.status.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{fund.fiscal_year_start}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{fund.fiscal_year_end}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-sm text-gray-500">No operational funds available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
