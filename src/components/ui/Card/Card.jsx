import { cn } from '@/lib/utils';
import {
  getCardClasses,
  getCardHeaderClasses,
  getCardContentClasses,
  getCardFooterClasses,
} from './card.styles';


export const Card = ({ className, variant, padding, radius, bordered, ...props }) => (
  <div
    className={cn(
      getCardClasses(variant, padding, radius, bordered), 
      className
    )}
    {...props}
  />
);

// Header
export const CardHeader = ({ className, padding, ...props }) => (
  <div className={cn(getCardHeaderClasses(padding), className)} {...props} />
);

// Title
export const CardTitle = ({ className, children, ...props }) => (
  <h3
    className={cn('text-2xl font-semibold tracking-tight leading-none', className)}
    {...props}
  >
    {children}
  </h3>
);

// Description
export const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

// Content
export const CardContent = ({ className, padding, ...props }) => (
  <div className={cn(getCardContentClasses(padding), className)} {...props} />
);

// Footer
export const CardFooter = ({ className, padding, ...props }) => (
  <div className={cn(getCardFooterClasses(padding), className)} {...props} />
);