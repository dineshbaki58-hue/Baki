import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Layout } from './ui/Layout';
import { Dashboard } from './ui/Dashboard';
import { Workouts } from './ui/Workouts';
import { Users } from './ui/Users';
const router = createBrowserRouter([
    {
        path: '/',
        element: _jsx(Layout, {}),
        children: [
            { index: true, element: _jsx(Dashboard, {}) },
            { path: 'workouts', element: _jsx(Workouts, {}) },
            { path: 'users', element: _jsx(Users, {}) },
        ],
    },
]);
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(RouterProvider, { router: router }) }));
