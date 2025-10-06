import { useEffect, useState } from 'react';

export function Dashboard() {
  const [stats, setStats] = useState<any>({ users: 0, workouts: 0, mealPlans: 0 });
  useEffect(() => {
    setStats({ users: 12, workouts: 34, mealPlans: 56 });
  }, []);
  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(stats).map(([k, v]) => (
        <div key={k} className="bg-zinc-900 rounded p-4">
          <div className="text-zinc-400 text-sm">{k}</div>
          <div className="text-3xl font-bold">{v as any}</div>
        </div>
      ))}
    </div>
  );
}
