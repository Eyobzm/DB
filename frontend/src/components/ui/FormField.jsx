/**
 * FormField - Label + input + inline Zod error message wrapper
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  helpText,
  children,
  className = '',
}) {
  // If children are provided, use them (for custom inputs like select, textarea)
  if (children) {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {error && (
          <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
            <AlertCircle size={14} />
            <span>{error.message || error}</span>
          </div>
        )}
        {helpText && !error && (
          <p className="text-gray-500 text-sm mt-1">{helpText}</p>
        )}
      </div>
    );
  }

  // Standard input rendering
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
          error
            ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
      />
      {error && (
        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
          <AlertCircle size={14} />
          <span>{error.message || error}</span>
        </div>
      )}
      {helpText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helpText}</p>
      )}
    </div>
  );
}
