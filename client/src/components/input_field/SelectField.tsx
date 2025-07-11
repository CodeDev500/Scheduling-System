import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string;
  options: Option[];
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  error,
  options,
  ...selectProps
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-1 font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        {...selectProps}
        className={`w-full text-gray-700 rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SelectField;
