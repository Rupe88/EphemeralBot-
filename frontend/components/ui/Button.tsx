'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-discord-blurple text-white hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        outline:
          'border border-discord-blurple text-discord-blurple hover:bg-discord-blurple hover:text-white',
        ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
        destructive: 'bg-discord-red text-white hover:bg-red-600',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-8 text-lg',
        xl: 'h-14 px-10 text-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function AnimatedButton({
  className,
  variant,
  size,
  children,
  loading = false,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={cn(buttonVariants({ variant, size, className }))}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : null}
      {children}
    </motion.button>
  );
}
