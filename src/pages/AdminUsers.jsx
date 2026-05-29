import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import useLangNavigate from '@/hooks/useLangNavigate';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminUsers = () => {
  const { t } = useTranslation('blog');
  const { t: tc } = useTranslation('common');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useLangNavigate();

  useEffect(() => {
    const uid  = localStorage.getItem('userUID');
    const role = localStorage.getItem('userRole');
    if (!uid || role !== 'admin') {
      setError(t('admin.accessDenied'));
      setLoading(false);
      return;
    }
    axios.get('http://localhost:5200/api/admin/users', {
      headers: { 'x-user-uid': uid, 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
    })
      .then(res => setUsers(res.data))
      .catch(err => setError(err.response?.data?.error || tc('errors.wentWrong')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t('admin.checkingAccess')}</div>;

  if (error) return (
    <div className="p-8 text-center">
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block">{error}</div>
      <br />
      <button onClick={() => navigate('/home')} className="mt-4 text-primary underline text-sm">
        {tc('notFound.back')}
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('admin.users')}</h1>
        <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
          <table className="min-w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('admin.email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('admin.role')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('admin.uid')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.uid}>
                  <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{u.uid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
