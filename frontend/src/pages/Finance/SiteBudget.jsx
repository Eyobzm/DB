/**
 * Site budget page
 */

import React, { useState } from 'react';
import { useSiteBudgets, useCreateSiteBudget, useUpdateSiteBudget } from '../../hooks/useFinance';

export function SiteBudget() {
  const [filterSiteId, setFilterSiteId] = useState('');
  const [threshold, setThreshold] = useState('0.2');
  const [formState, setFormState] = useState({
    site_id: '',
    allocated_amount: '',
    spent_to_date: '',
    committed_amount: '',
    fiscal_year_start: new Date().toISOString().slice(0, 10),
    fiscal_year_end: new Date().toISOString().slice(0, 10),
  });
  const [editBudget, setEditBudget] = useState(null);

  const budgetsQuery = useSiteBudgets({
    site_id: filterSiteId ? Number(filterSiteId) : undefined,
    threshold: Number(threshold),
  });

  const createBudget = useCreateSiteBudget();
  const updateBudget = useUpdateSiteBudget();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...formState,
      site_id: Number(formState.site_id),
      allocated_amount: Number(formState.allocated_amount),
      spent_to_date: Number(formState.spent_to_date || 0),
      committed_amount: Number(formState.committed_amount || 0),
    };
    createBudget.mutate(payload);
  };

  const handleEdit = (budget) => {
    setEditBudget(budget);
    setFormState({
      site_id: budget.site_id.toString(),
      allocated_amount: budget.allocated_amount.toString(),
      spent_to_date: budget.spent_to_date.toString(),
      committed_amount: budget.committed_amount.toString(),
      fiscal_year_start: budget.fiscal_year_start,
      fiscal_year_end: budget.fiscal_year_end,
    });
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    if (!editBudget) return;

    updateBudget.mutate({
      id: editBudget.site_budget_id,
      allocated_amount: Number(formState.allocated_amount),
      spent_to_date: Number(formState.spent_to_date || 0),
      committed_amount: Number(formState.committed_amount || 0),
      fiscal_year_start: formState.fiscal_year_start,
      fiscal_year_end: formState.fiscal_year_end,
    });
    setEditBudget(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Site Budgeting</h1>
          <p className="text-gray-600 mt-2">Create and monitor site budget allocations, committed spend, and remaining balances.</p>

          <form onSubmit={editBudget ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Site ID</span>
              <input
                type="number"
                name="site_id"
                value={formState.site_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Allocated Amount</span>
              <input
                type="number"
                step="0.01"
                name="allocated_amount"
                value={formState.allocated_amount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Spent to Date</span>
              <input
                type="number"
                step="0.01"
                name="spent_to_date"
                value={formState.spent_to_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Committed Amount</span>
              <input
                type="number"
                step="0.01"
                name="committed_amount"
                value={formState.committed_amount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {editBudget ? 'Update Budget' : 'Create Budget'}
              </button>
              {editBudget && (
                <button
                  type="button"
                  onClick={() => {
                    setEditBudget(null);
                    setFormState({
                      site_id: '',
                      allocated_amount: '',
                      spent_to_date: '',
                      committed_amount: '',
                      fiscal_year_start: new Date().toISOString().slice(0, 10),
                      fiscal_year_end: new Date().toISOString().slice(0, 10),
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Site Budgets</h2>
                <p className="text-gray-600 mt-1">Track remaining balances and identify variance alerts.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Filter Site ID</span>
                  <input
                    type="number"
                    value={filterSiteId}
                    onChange={(event) => setFilterSiteId(event.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Site ID"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Variance Threshold</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={threshold}
                    onChange={(event) => setThreshold(event.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Site', 'Allocated', 'Spent', 'Committed', 'Remaining', 'Status', 'Alerts'].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetsQuery.isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-sm text-gray-500">Loading budgets...</td>
                  </tr>
                ) : budgetsQuery.data?.length ? (
                  budgetsQuery.data.map((budget) => (
                    <tr key={budget.site_budget_id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{budget.site_budget_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{budget.site_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${budget.allocated_amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${budget.spent_to_date.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${budget.committed_amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${budget.remaining_balance.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{budget.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {budget.variance_alert ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                            Variance
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-sm text-gray-500">No site budgets found.</td>
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
