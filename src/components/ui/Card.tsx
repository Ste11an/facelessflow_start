'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-xl shadow-lg overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 border border-gray-800',
        elevated: 'bg-gray-900 border border-gray-800 shadow-xl',
        gradient: 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700',
        highlight: 'bg-gray-900 border border-indigo-900/50',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: ReactNode
  animate?: boolean
}

export default function Card({
  children,
  variant,
  padding,
  animate = true,
  className,
  ...props
}: CardProps) {
  const Component = animate ? motion.div : 'div'

  return (
    <Component
      className={`${cardVariants({ variant, padding })} ${className ?? ''}`}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={animate ? { duration: 0.5 } : undefined}
      {...props}
    >
      {children}
    </Component>
  )
}
