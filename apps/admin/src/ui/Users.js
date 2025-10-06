import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function Users() {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        setUsers([{ id: 'u1', email: 'user@example.com' }]);
    }, []);
    return (_jsxs("div", { className: "bg-zinc-900 rounded p-4", children: [_jsx("div", { className: "font-bold mb-2", children: "Users" }), _jsx("ul", { className: "list-disc pl-5", children: users.map((u) => (_jsx("li", { children: u.email }, u.id))) })] }));
}
