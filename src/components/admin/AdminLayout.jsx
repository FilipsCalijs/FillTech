import { NavLink } from 'react-router-dom';
import { Users, FileText, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminLayout = ({ children }) => {
  const { t } = useTranslation('blog');

  const nav = [
    { to: '/admin/users',   labelKey: 'admin.users',   icon: Users },
    { to: '/admin/blog',    labelKey: 'admin.blog',    icon: FileText },
    { to: '/admin/effects', labelKey: 'admin.effects', icon: Sparkles },
  ];

  return (
    <div className="py-8 flex flex-col items-center gap-6 w-full">
      <div className="flex gap-2 bg-muted rounded-xl p-1">
        {nav.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`
            }
          >
            <Icon size={16} />
            {t(labelKey)}
          </NavLink>
        ))}
      </div>
      <div className="w-full max-w-5xl">{children}</div>
    </div>
  );
};

export default AdminLayout;
