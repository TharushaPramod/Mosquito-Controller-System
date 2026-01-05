import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, active, onClick, isOpen }) => {
    return (
        <button
            onClick={onClick}
            title={!isOpen ? label : undefined}
            className={clsx(
                "relative w-full flex items-center rounded-lg transition-colors duration-200",
                isOpen ? "px-4 py-3 gap-3" : "p-3 justify-center",
                active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
        >
            {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-md" />
            )}

            <div className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10">
                <Icon size={18} strokeWidth={2} />
            </div>

            {isOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                    {label}
                </span>
            )}
        </button>
    );
};

export default SidebarItem;
