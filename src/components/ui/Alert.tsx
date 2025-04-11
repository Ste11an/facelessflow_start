'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AlertProps {
  title?: string;
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  onClose?: () => void;
  className?: string; // ✅ Här är fixen!
}

export default function Alert({
  title,
  children,
  variant = 'info',
  icon,
  onClose,
  className = '', // ✅ lägg till default
}: AlertProps) {
  const variantStyles = {
    info: 'bg-blue-900/30 border-blue-800/50 text-blue-400',
    success: 'bg-green-900/30 border-green-800/50 text-green-400',
    warning: 'bg-yellow-900/30 border-yellow-800/50 text-yellow-400',
    error: 'bg-red-900/30 border-red-800/50 text-red-400',
  };

  return (
    <motion.div
      className={`rounded-md border p-4 ${variantStyles[variant]} ${className}`} // ✅ inkluderar className
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex">
        {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
        <div className="flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {onClose && (
          <div className="ml-3">
            <button
              type="button"
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
