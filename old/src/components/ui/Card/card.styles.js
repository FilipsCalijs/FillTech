import { cva } from 'class-variance-authority';

export const cardVariants = cva('shadow-sm bg-card text-card-foreground', {
  variants: {
    variant: {
      default: '',
      elevated: 'shadow-md hover:shadow-lg transition-shadow',
      outline: 'border-2',
      ghost: 'border-0 shadow-none',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    radius: { 
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
    bordered: {
      md: 'border-2 border-border',
      lg: 'border-4 border-border',
      disable: 'border-0',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'sm',
    radius: 'sm',
    bordered: 'lg',
  },
});

export const cardHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    padding: 'sm',
  },
});

export const cardContentVariants = cva('', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-4 pt-0',
      md: 'p-6 pt-0',
      lg: 'p-8 pt-0',
    },
  },
  defaultVariants: {
    padding: 'sm',
  },
});

export const cardFooterVariants = cva('flex items-center', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-4 pt-0',
      md: 'p-6 pt-0',
      lg: 'p-8 pt-0',
    },
  },
  defaultVariants: {
    padding: 'sm',
  },
});

export const getCardClasses = (variant, padding, radius, bordered) =>
  cardVariants({ variant, padding, radius, bordered });

export const getCardHeaderClasses = (padding) =>
  cardHeaderVariants({ padding });

export const getCardContentClasses = (padding) =>
  cardContentVariants({ padding });

export const getCardFooterClasses = (padding) =>
  cardFooterVariants({ padding });