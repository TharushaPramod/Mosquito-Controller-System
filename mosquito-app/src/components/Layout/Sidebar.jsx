import React from 'react';
import { LayoutDashboard, Layers, AlertCircle, FileText, Map as MapIcon, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, active, onClick, isOpen }) => {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200",
                active ? "text-white border-l-4 border-white bg-white/10" : "text-gray-300 hover:bg-white/5 hover:text-white",
                !isOpen && "justify-center px-2"
            )}
            title={!isOpen ? label : undefined}
        >
            <Icon size={20} />
            {isOpen && <span className="font-medium whitespace-nowrap">{label}</span>}
        </div>
    );
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        navigate('/login');
    };

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Data Integration', icon: Layers, path: '/data-integration' },
        { label: 'Alerts', icon: AlertCircle, path: '/alerts' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Map', icon: MapIcon, path: '/map' },
    ];

    const getActiveItem = () => {
        if (location.pathname === '/') return 'Dashboard';
        if (location.pathname.startsWith('/data-integration') || location.pathname.startsWith('/facility')) return 'Data Integration';
        if (location.pathname.startsWith('/alerts')) return 'Alerts';
        if (location.pathname.startsWith('/reports')) return 'Reports';
        if (location.pathname.startsWith('/map')) return 'Map';
        return 'Dashboard';
    };

    const activeItem = getActiveItem();

    return (
        <div
            className={clsx(
                "h-screen bg-[#2F6A5F] flex flex-col text-white fixed left-0 top-0 transition-all duration-300 z-50",
                isOpen ? "w-64" : "w-20"
            )}
        >
            {/* Logo & Toggle */}
            <div className="relative h-20 flex items-center">
                <div
                    className={clsx("w-full px-6 flex items-center cursor-pointer", isOpen ? "justify-between" : "justify-center")}
                    onClick={() => navigate('/')}
                >
                    {isOpen ? (
                        <h1 className="text-2xl font-bold italic tracking-wider">SMCS</h1>
                    ) : (
                        <h1 className="text-xl font-bold italic">SM</h1>
                    )}
                </div>

                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute text-white hover:text-gray-200 transition-colors"
                    style={{
                        left: isOpen ? '83.39%' : '50%',
                        transform: isOpen ? 'none' : 'translateX(-50%)',
                        top: '30%', // Adjusted slightly to align with logo center vertically roughly
                    }}
                >
                    {isOpen ? (
                        <div className="flex items-center h-6 border-l border-white/30 pl-2">
                            <ChevronLeft size={24} />
                        </div>
                    ) : (
                        <div className="mt-12"> {/* Push down below logo when collapsed */}
                            <ChevronRight size={24} />
                        </div>
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-6 overflow-hidden">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={activeItem === item.label}
                        onClick={() => {
                            navigate(item.path);
                        }}
                        isOpen={isOpen}
                    />
                ))}
            </nav>

            {/* Logout */}
            <div className="p-6">
                <button
                    onClick={handleLogout}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 border border-white/30 rounded-lg text-sm hover:bg-white/10 w-full justify-center transition-colors",
                        !isOpen && "px-0 border-0"
                    )}
                >
                    {isOpen && <span>Logout</span>}
                    <LogOut size={16} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
