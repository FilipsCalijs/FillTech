import { cva } from 'class-variance-authority';

export const uploadVariants = cva(
  'flex items-center justify-center border-2 border-dashed text-center cursor-pointer transition-colors',
  {
    variants: {
      color: {
        default: 'border-gray-300 text-gray-600 bg-background ',
        primary: 'border-blue-500 text-blue-600 bg-blue-50',
        secondary: 'border-green-500 text-green-600 bg-green-50 ',
      },
      radius: {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      margin: {
        none: 'm-0',
        mx: 'mx-4',
        my: 'my-4',
        m: 'm-4',
      },
    },
    defaultVariants: {
      color: 'default',
      radius: 'xl',
      padding: 'md',
      margin: 'none',
    },
  }
);

export const getUploadClasses = (color, radius, padding, margin) =>
  uploadVariants({ color, radius, padding, margin });
