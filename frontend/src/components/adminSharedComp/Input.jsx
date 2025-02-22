const Input = ({
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    className = '',
    label,
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
      ring-offset-background
      placeholder:text-muted-foreground
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
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${baseInputClass} ${error ? 'border-destructive' : ''} ${className}`}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  };

  export default Input