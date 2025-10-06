import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
export function Layout() {
    const { pathname } = useLocation();
    const link = (to, label) => (_jsx(Link, { to: to, className: clsx('px-3 py-2 rounded', pathname === to ? 'bg-brand' : 'hover:bg-zinc-800'), children: label }));
    return (_jsxs("div", { className: "min-h-screen grid grid-rows-[auto,1fr]", children: [_jsxs("header", { className: "flex items-center justify-between p-4 border-b border-zinc-800", children: [_jsx("div", { className: "font-bold", children: "BakiFitness Admin" }), _jsxs("nav", { className: "flex gap-2", children: [link('/', 'Dashboard'), link('/workouts', 'Workouts'), link('/users', 'Users')] })] }), _jsx("main", { className: "p-6", children: _jsx(Outlet, {}) })] }));
}
