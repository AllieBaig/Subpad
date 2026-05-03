import React, { useState, useEffect } from 'react';

interface NumericKeypadInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'value'> {
  value: number;
  min?: number;
  max?: number;
  onCommit: (value: number) => void;
  className?: string;
  allowFloat?: boolean;
}

export const NumericKeypadInput: React.FC<NumericKeypadInputProps> = ({ 
  value, 
  min = 1, 
  max = 1900, 
  onCommit, 
  className,
  allowFloat = false,
  ...props 
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  // Keep internal state in sync with external value if external value changes (e.g. from props)
  useEffect(() => {
    // Only update if the numerical value changed, to avoid wiping out "0" or empty string while typing
    if (parseFloat(inputValue) !== value) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Filter non-numeric characters
    if (allowFloat) {
      val = val.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = val.split('.');
      if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    } else {
      val = val.replace(/[^0-9]/g, '');
    }

    setInputValue(val);
    
    // Auto-commit if valid number to keep state in sync
    if (val !== '' && val !== '.') {
      const num = allowFloat ? parseFloat(val) : parseInt(val, 10);
      if (!isNaN(num)) {
        onCommit(num);
      }
    }
  };

  const handleBlur = () => {
    let num = allowFloat ? parseFloat(inputValue) : parseInt(inputValue, 10);
    if (isNaN(num)) num = min;
    
    const clamped = Math.max(min, Math.min(max, num));
    setInputValue(clamped.toString());
    onCommit(clamped);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={(e) => e.currentTarget.select()}
      className={className}
      {...props}
    />
  );
};
