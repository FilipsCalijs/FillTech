import { cn } from '@/lib/utils';
import { typographyVariants } from './typography.styles';

export const Typography = ({
  variant,
  color,
  weight,
  truncate,
  align,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        typographyVariants({ variant, color, weight, truncate, align }),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};