import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, MapPin, FileText } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/forecast', label: 'Forecast', icon: Activity },
        { path: '/map', label: 'Map', icon: MapPin },
        { path: '/reports', label: 'Reports', icon: FileText },
    ];

    return (
        <nav className="shadow-lg bg-[#2F6A5F]">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-center h-16">
                    {/* Navigation Links - Centered */}
                    <div className="flex items-center space-x-8">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${isActive(path)
                                        ? 'bg-black/20 text-white shadow-inner'
                                        : 'text-gray-100 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;