import React from 'react';
import clsx from 'clsx';

type Mode = 'bridgelayer' | 'firm';

interface ModeToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

/**
 * Toggle between authentication modes (Bridgelayer, FirmSync).
 * Accessible: renders buttons with appropriate aria-pressed.
 */
export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div role="tablist" aria-label="Authentication Mode" className="flex justify-center space-x-4 mb-4">
      {(['bridgelayer', 'firm'] as Mode[]).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          className={clsx(
            'px-4 py-2 font-medium focus:outline-none',
            mode === m
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          )}
        >
          {m === 'bridgelayer' ? 'Bridgelayer' : 'FirmSync'}
        </button>
      ))}
    </div>
  );
}
