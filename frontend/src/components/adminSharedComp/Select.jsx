const Select = ({
    name,
    value,
    onChange,
    options = [],
    placeholder,
    label,
    error,
    className = '',
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
      ring-offset-background
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-ring
      focus-visible:ring-offset-2
      disabled:cursor-not-allowed
      disabled:opacity-50
    `;
  
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none text-foreground">
            {label}
          </label>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${baseSelectClass} ${error ? 'border-destructive' : ''} ${className}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option 
              key={option.value || option} 
              value={option.value || option}
            >
              {option.label || option}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  };

  export default Select