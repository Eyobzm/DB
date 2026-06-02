/**
 * Client payments page
 */

import React, { useState } from 'react';
import { useClientPayments, useCreateClientPayment } from '../../hooks/useFinance';

export function ClientPayments() {
  const [formState, setFormState] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    site_id: '',
    amount: '',
    payment_method: '',
    reference_number: '',
    invoice_number: '',
    description: '',
    status: 'Pending',
  });

  const paymentsQuery = useClientPayments();
  const createPayment = useCreateClientPayment();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...formState,
      site_id: Number(formState.site_id),
      amount: Number(formState.amount),
    };
    createPayment.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Client Payments</h1>
          <p className="text-gray-600 mt-2">Record incoming client receipts and review site payment history.</p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
              <span className="text-sm font-medium text-gray-700">Payment Date</span>
              <input
                type="date"
                name="payment_date"
                value={formState.payment_date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Amount</span>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formState.amount}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Payment Method</span>
              <input
                type="text"
                name="payment_method"
                value={formState.payment_method}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <select
                name="status"
                value={formState.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Failed">Failed</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Reference #</span>
              <input
                type="text"
                name="reference_number"
                value={formState.reference_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Invoice #</span>
              <input
                type="text"
                name="invoice_number"
                value={formState.invoice_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Save Client Payment
              </button>
              {createPayment.isLoading && <span className="ml-4 text-gray-500">Saving...</span>}
              {createPayment.isError && (
                <p className="text-red-600 mt-2">Failed to save payment. Please try again.</p>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Site', 'Date', 'Amount', 'Status', 'Method', 'Reference', 'Invoice'].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentsQuery.isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-sm text-gray-500">Loading payments...</td>
                  </tr>
                ) : paymentsQuery.data?.length ? (
                  paymentsQuery.data.map((payment) => (
                    <tr key={payment.client_payment_id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.client_payment_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.site_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.payment_date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.payment_method || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.reference_number || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.invoice_number || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-sm text-gray-500">No client payments recorded.</td>
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
