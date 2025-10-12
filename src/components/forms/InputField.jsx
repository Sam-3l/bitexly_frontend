// src/components/forms/InputField.jsx
export default function InputField({ label, type, name, value, onChange, placeholder }) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  }  