// src/components/Select.jsx
import React from 'react';

const Select = ({
  name,
  value,
  onChange,
  options = [], // Provide default empty array
  placeholder,
  required = false,
  className = '',
  label,
  error,
}) => {
  const baseSelectClass = `
    w-full
    rounded-md
    border
    border-input
    bg-background
    px-3
    py-2
    text-sm
    transition-colors
    focus:outline-none
    focus:ring-2
    focus:ring-primary-main
    focus:ring-offset-2
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

  const errorClass = error ? 'border-destructive focus:ring-destructive' : '';
  const selectClass = `${baseSelectClass} ${errorClass} ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={selectClass}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {Array.isArray(options) && options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default Select;