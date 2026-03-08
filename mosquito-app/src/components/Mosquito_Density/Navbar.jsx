import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, Activity, MapPin, FileText, ShieldAlert } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/mosquito-density-dashboard", label: "Dashboard", icon: Home },
    { path: "/m_reports", label: "Reports Upload", icon: FileText },
    { path: "/analysis", label: "Analysis", icon: LayoutDashboard },
    { path: "/table", label: "Table", icon: Activity },
    { path: "/spatialmap", label: "Map", icon: MapPin },
    { path: "/mosquito-instructions", label: "Instructions", icon: ShieldAlert },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-[#2F6A5F] shadow-md sticky top-0 z-50">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-16">

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">

            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);

              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-white text-[#2F6A5F] shadow"
                      : "text-gray-100 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              );
            })}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;