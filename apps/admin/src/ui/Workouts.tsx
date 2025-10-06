import { useEffect, useState } from 'react';

export function Workouts() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    setWorkouts([{ id: 'w1', title: 'Deadlift' }]);
  }, []);

  return (
    <div className="grid gap-4">
      <div className="bg-zinc-900 rounded p-4">
        <div className="font-bold mb-2">Upload/Create Workout</div>
        <div className="flex gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-zinc-800 rounded px-3 py-2 w-full" placeholder="Title" />
          <button className="bg-brand px-4 rounded">Save</button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded p-4">
        <div className="font-bold mb-2">All Workouts</div>
        <ul className="list-disc pl-5">
          {workouts.map((w) => (
            <li key={w.id}>{w.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
