import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function Workouts() {
    const [workouts, setWorkouts] = useState([]);
    const [title, setTitle] = useState('');
    useEffect(() => {
        setWorkouts([{ id: 'w1', title: 'Deadlift' }]);
    }, []);
    return (_jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "bg-zinc-900 rounded p-4", children: [_jsx("div", { className: "font-bold mb-2", children: "Upload/Create Workout" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), className: "bg-zinc-800 rounded px-3 py-2 w-full", placeholder: "Title" }), _jsx("button", { className: "bg-brand px-4 rounded", children: "Save" })] })] }), _jsxs("div", { className: "bg-zinc-900 rounded p-4", children: [_jsx("div", { className: "font-bold mb-2", children: "All Workouts" }), _jsx("ul", { className: "list-disc pl-5", children: workouts.map((w) => (_jsx("li", { children: w.title }, w.id))) })] })] }));
}
