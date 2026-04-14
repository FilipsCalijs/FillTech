import { NavLink } from 'react-router-dom';
import { Users, FileText } from 'lucide-react';

const nav = [
  { to: '/admin/users', label: 'Пользователи', icon: Users },
  { to: '/admin/blog',  label: 'Блог',          icon: FileText },
];

const AdminLayout = ({ children }) => (
  <div className="py-8 flex flex-col items-center gap-6 w-full">
    <div className="flex gap-2 bg-muted rounded-xl p-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActive
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </div>

    <div className="w-full max-w-5xl">
      {children}
    </div>
  </div>
);

export default AdminLayout;
