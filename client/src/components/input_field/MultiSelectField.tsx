import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  label: string;
  id: string;
  name: string;
  value: string[];
  onChange: (name: string, value: string[]) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select options...",
  error,
  className = "",
  searchable = true,
  searchPlaceholder = "Search options...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleToggleOption = (optionValue: string) => {
    // Ensure value is always an array
    const valueArray = Array.isArray(value) ? value : [];
    const newValue = valueArray.includes(optionValue)
      ? valueArray.filter(v => v !== optionValue)
      : [...valueArray, optionValue];
    onChange(name, newValue);
  };

  const handleRemoveOption = (optionValue: string) => {
    // Ensure value is always an array
    const valueArray = Array.isArray(value) ? value : [];
    const newValue = valueArray.filter(v => v !== optionValue);
    onChange(name, newValue);
  };

  const getSelectedLabels = () => {
    // Ensure value is always an array
    const valueArray = Array.isArray(value) ? value : [];
    return valueArray.map(v => {
      const option = options.find(opt => opt.value === v);
      return option ? option.label : v;
    });
  };

  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Clear search when dropdown closes
  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchTerm("");
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className={`mb-4 ${className} text-gray-700`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div className="relative">
        <div
          className={`min-h-[40px] w-full px-3 py-2 border rounded-md cursor-pointer bg-white ${
            error ? 'border-red-500' : 'border-gray-300'
          } focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500`}
          onClick={handleToggleDropdown}
          onKeyDown={handleKeyDown}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {(!Array.isArray(value) || value.length === 0) ? (
              <span className="text-gray-500 text-sm">{placeholder}</span>
            ) : (
              getSelectedLabels().map((label, index) => {
                const valueArray = Array.isArray(value) ? value : [];
                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(valueArray[index]);
                      }}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
          <ChevronDown 
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsOpen(false);
                        setSearchTerm("");
                      }
                      e.stopPropagation();
                    }}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  {searchTerm ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const valueArray = Array.isArray(value) ? value : [];
                  return (
                    <div
                      key={option.value}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                        valueArray.includes(option.value) ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                      onClick={() => handleToggleOption(option.value)}
                    >
                      <span className="text-sm">{option.label}</span>
                      {valueArray.includes(option.value) && (
                        <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default MultiSelectField;