import { Link, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';

export function Layout() {
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <Link to={to} className={clsx('px-3 py-2 rounded', pathname === to ? 'bg-brand' : 'hover:bg-zinc-800')}>{label}</Link>
  );
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="font-bold">BakiFitness Admin</div>
        <nav className="flex gap-2">
          {link('/', 'Dashboard')}
          {link('/workouts', 'Workouts')}
          {link('/users', 'Users')}
        </nav>
      </header>
      <main className="p-6"><Outlet /></main>
    </div>
  );
}
