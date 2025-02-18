// src/components/Input.jsx
import React from 'react';

const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  label,
  maxLength,
  rows,
  checked,
  error,
}) => {
  const baseInputClass = `
    w-full
    rounded-md
    border
    border-input
    bg-background
    px-3
    py-2
    text-sm
    transition-colors
    placeholder:text-muted-foreground
    focus:outline-none
    focus:ring-2
    focus:ring-primary-main
    focus:ring-offset-2
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

  const errorClass = error ? 'border-destructive focus:ring-destructive' : '';
  const inputClass = `${baseInputClass} ${errorClass} ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <div>
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={inputClass}
            rows={rows || 4}
            maxLength={maxLength}
          />
        ) : type === 'checkbox' ? (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={name}
              checked={checked}
              onChange={onChange}
              className="h-4 w-4 rounded border-gray-300 text-primary-main focus:ring-primary-main"
            />
            <span className="text-sm text-gray-700">{placeholder}</span>
          </label>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={inputClass}
            maxLength={maxLength}
          />
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default Input;