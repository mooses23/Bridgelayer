// src/app/firmsync/[tenantId]/paralegal-plus/components/FilterDropdown.tsx
// Reusable filter dropdown component for Paralegal+ tabs

'use client';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = 'All'
}: FilterDropdownProps) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
