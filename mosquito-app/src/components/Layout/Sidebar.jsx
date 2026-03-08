import React from 'react';
import {
    LayoutDashboard,
    Settings,
    TrendingUp,
    HeartPulse,
    LogOut,
    Menu,
    ChevronLeft,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import SidebarItem from './SidebarItem';
    
const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Mosquito Dashboard', icon: LayoutDashboard, path: '/mosquito-dashboard' },
        { label: 'Device Control', icon: Settings, path: '/deviceControll-dashboard' },
        { label: 'Density Prediction', icon: TrendingUp, path: '/mosquito-density-dashboard' },
        { label: 'Health Data Integration', icon: HeartPulse, path: '/' },
    ];

    const healthRoutes = ['/', '/data-integration', '/alerts', '/reports', '/map'];
    const isHealthRoute = healthRoutes.some(route =>
        location.pathname === route || location.pathname.startsWith('/facility')
    );

    return (
        <aside
            className={clsx(
                "fixed left-0 top-0 h-screen bg-[#24584F] text-white flex flex-col transition-all duration-300 shadow-lg z-50",
                isOpen ? "w-64" : "w-20"
            )}
        >
            {/* Brand */}
            <div className="flex items-center justify-between px-4 py-6">
                {isOpen ? (
                    <h1 className="text-lg font-semibold leading-snug">
                        Smart Mosquito<br />Control
                    </h1>
                ) : (
                    <div className="flex items-center justify-center w-10 h-10 font-bold rounded-md bg-white/15">
                        S
                    </div>
                )}

                <button
                    onClick={toggleSidebar}
                    className="transition text-white/60 hover:text-white"
                >
                    {isOpen ? <ChevronLeft size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1">
                {menuItems.map(item => (
                    <SidebarItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={
                            (item.label === 'Health Data Integration' && isHealthRoute) ||
                            (location.pathname === item.path && item.path !== '#')
                        }
                        onClick={() => item.path !== '#' && navigate(item.path)}
                        isOpen={isOpen}
                    />
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4">
                <button
                    onClick={() => navigate('/login')}
                    className={clsx(
                        "w-full flex items-center rounded-lg transition-colors duration-200",
                        isOpen ? "px-4 py-3 gap-3" : "p-3 justify-center",
                        "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                >
                    <div className="flex items-center justify-center rounded-md w-9 h-9 bg-white/10">
                        <LogOut size={18} />
                    </div>
                    {isOpen && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
