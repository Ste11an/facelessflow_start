'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}: ToggleProps) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${
          checked ? 'bg-indigo-600' : 'bg-gray-700'
        }`}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
      >
        <span className="sr-only">Toggle</span>
        <motion.span
          className="inline-block h-4 w-4 rounded-full bg-white"
          initial={false}
          animate={{
            x: checked ? 14 : 2,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      {label && (
        <span className="ml-3 text-sm text-gray-300">{label}</span>
      )}
    </div>
  );
}
