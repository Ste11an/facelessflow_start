'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      className="text-center py-12 px-4 rounded-xl border border-gray-800 bg-gray-900/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {icon && (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-800 text-indigo-400 mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
