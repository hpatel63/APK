import { useEffect, useState } from 'react';
import axios from 'axios';

const UserSettings = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'associate' });

  const loadUsers = () => axios.get('/api/settings/users').then((response) => setUsers(response.data.users));

  useEffect(() => {
    loadUsers();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await axios.post('/api/settings/users', form);
    setForm({ username: '', password: '', role: 'associate' });
    loadUsers();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="grid grid-cols-4 gap-4">
        <input
          placeholder="Username"
          value={form.username}
          onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
        />
        <input
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
        />
        <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          <option value="associate">Associate</option>
          <option value="manager">Manager</option>
        </select>
        <button type="submit" className="px-4 py-2 rounded-lg bg-aurora-neon/20 border border-aurora-neon text-aurora-neon">
          Add User
        </button>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="text-white/60">
          <tr>
            <th className="py-2">Username</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-white/10">
              <td className="py-2">{user.username}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserSettings;
