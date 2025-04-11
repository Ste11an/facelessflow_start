'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

const selectVariants = cva(
  "block w-full px-3 py-2 bg-gray-800 border rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
  {
    variants: {
      variant: {
        default: "border-gray-700",
        error: "border-red-500",
      },
      sizing: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      sizing: "md",
    },
  }
);

type SelectVariantProps = VariantProps<typeof selectVariants>;

export interface SelectProps extends
  React.SelectHTMLAttributes<HTMLSelectElement>,
  Omit<SelectVariantProps, 'size'> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  options,
  variant,
  sizing,
  className = '',
  ...props
}: SelectProps) {
  const classes = `${selectVariants({ variant: error ? 'error' : variant, sizing })} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select className={classes} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <motion.p
          className="mt-1 text-sm text-red-500"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
