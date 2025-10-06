import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function Dashboard() {
    const [stats, setStats] = useState({ users: 0, workouts: 0, mealPlans: 0 });
    useEffect(() => {
        setStats({ users: 12, workouts: 34, mealPlans: 56 });
    }, []);
    return (_jsx("div", { className: "grid grid-cols-3 gap-4", children: Object.entries(stats).map(([k, v]) => (_jsxs("div", { className: "bg-zinc-900 rounded p-4", children: [_jsx("div", { className: "text-zinc-400 text-sm", children: k }), _jsx("div", { className: "text-3xl font-bold", children: v })] }, k))) }));
}
