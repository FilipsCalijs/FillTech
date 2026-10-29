import { cn } from '@/lib/utils';
import { typographyVariants } from './typography.styles';

const TAG_MAP = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
};

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
  const Tag = TAG_MAP[variant] ?? 'span';
  return (
    <Tag
      className={cn(
        typographyVariants({ variant, color, weight, truncate, align }),
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};