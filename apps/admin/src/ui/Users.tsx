import { useEffect, useState } from 'react';

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    setUsers([{ id: 'u1', email: 'user@example.com' }]);
  }, []);
  return (
    <div className="bg-zinc-900 rounded p-4">
      <div className="font-bold mb-2">Users</div>
      <ul className="list-disc pl-5">
        {users.map((u) => (
          <li key={u.id}>{u.email}</li>
        ))}
      </ul>
    </div>
  );
}
