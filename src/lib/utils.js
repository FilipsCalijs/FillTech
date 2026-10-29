import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatDate = (date) => new Date(date).toLocaleString();

export const getInitials = (name) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
