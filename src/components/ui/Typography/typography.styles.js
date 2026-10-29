import { cva } from 'class-variance-authority';

export const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-[40px] leading-tight font-bold',
      h2: 'text-[40px] leading-[1.2] font-semibold',
      h3: 'text-[28px] leading-[1.3] font-semibold',
      h4: 'text-xl font-semibold',
      h5: 'text-base font-medium',
      h6: 'text-sm font-medium',
      lead: 'text-[26px] leading-[1.5]',
      body1: 'text-[18px] leading-[1.6]',
      body2: 'text-base',
      body3: 'text-sm',
      caption: 'text-sm',
      label: 'text-base font-medium',
    },
    color: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      foreground: 'text-foreground',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
  },
  defaultVariants: {
    variant: 'body1',
    color: 'foreground',
    weight: 'normal',
    truncate: false,
    align: 'left',
  },
});
