'use client';

import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-800 text-gray-300",
        primary: "bg-indigo-900/30 text-indigo-400 border border-indigo-800/50",
        success: "bg-green-900/30 text-green-400 border border-green-800/50",
        warning: "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50",
        danger: "bg-red-900/30 text-red-400 border border-red-800/50",
        info: "bg-blue-900/30 text-blue-400 border border-blue-800/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends 
  React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof badgeVariants> {
  children: ReactNode;
}

export default function Badge({
  children,
  variant,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={badgeVariants({ variant, className })}
      {...props}
    >
      {children}
    </span>
  );
}
