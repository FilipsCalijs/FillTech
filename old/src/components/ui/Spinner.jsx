export const Spinner = ({ size = 20, className = '' }) => (
  <svg
    className={`animate-spin text-muted-foreground ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12" cy="12" r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="44"
      strokeDashoffset="30"
    />
  </svg>
);

export const PageLoader = ({ className = '' }) => (
  <div className={`flex items-center justify-center min-h-[280px] ${className}`}>
    <Spinner size={28} />
  </div>
);
