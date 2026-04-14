import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const uid = localStorage.getItem('userUID');
        const role = localStorage.getItem('userRole');

      
        if (!uid || role !== 'admin') {
          setError("Доступ запрещен. У вас нет прав администратора.");
          setLoading(false);
          return;
        }

        // 2. Запрос к бэкенду
        const res = await axios.get('http://localhost:5200/api/admin/users', {
          headers: {
            'x-user-uid': uid,
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        setUsers(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Ошибка при загрузке списка');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="p-8 text-center">Проверка доступа...</div>;
  
  if (error) return (
    <div className="p-8 text-center">
      <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
        {error}
      </div>
      <br />
      <button 
        onClick={() => navigate('/home')}
        className="mt-4 text-blue-500 underline"
      >
        Вернуться на главную
      </button>
    </div>
  );

  return (
    <AdminLayout>
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Пользователи</h1>
      <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
        <table className="min-w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Роль</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">UID</th>
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