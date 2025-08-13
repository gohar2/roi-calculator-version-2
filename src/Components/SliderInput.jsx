import React, { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';

const SliderInput = ({ label, value, onChange, min, max, step = 1, suffix = '', decimals = 0 }) => {
  const [inputValue, setInputValue] = useState(value);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleInputBlur = () => {
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      // Clamp the value between min and max
      const clampedValue = Math.min(Math.max(numericValue, min), max);
      // Round to nearest step
      const steppedValue = Math.round(clampedValue / step) * step;
      // Round to specified decimal places
      const finalValue = Math.round(steppedValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
      setInputValue(finalValue);
      onChange(finalValue);
    } else {
      // Reset to current value if invalid
      setInputValue(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  // Format display value with proper decimal places
  const formatDisplayValue = (val) => {
    if (suffix === '$') {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-darkBlue">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            min={min}
            max={max}
            step={step}
            className="w-20 px-2 py-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-lg font-bold text-lightGreen">{formatDisplayValue(value)}</span>
        </div>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-6"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => {
          onChange(v);
          setInputValue(v);
        }}
      >
        <Slider.Track className="bg-gray-300 relative grow rounded-full h-dot25">
          <Slider.Range className="absolute bg-black-333 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb 
          className="block w-1 h-1 bg-lightGreen rounded-full shadow hover:scale-110 transition-transform cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
          aria-label={label}
        />
      </Slider.Root>
      <div className="flex justify-between text-xs text-darkBlue mt-1">
        <span>{formatDisplayValue(min)}</span>
        <span>{formatDisplayValue(max)}</span>
      </div>
    </div>
  );
};

export default SliderInput; 