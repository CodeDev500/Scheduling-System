import React, { type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error: string;
}

const InputFiled: React.FC<InputFieldProps> = ({
  label,
  id,
  error,
  ...inputProps
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-1 font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className={`w-full text-gray-700 rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputFiled;
