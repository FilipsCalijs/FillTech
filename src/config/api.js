// Base URL for backend API calls.
// Local dev: defaults to http://localhost:5200
// Production: set VITE_API_URL='' at build time so calls become relative /api/... (proxied by nginx)
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5200';
