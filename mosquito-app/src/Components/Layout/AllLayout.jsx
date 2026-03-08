import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import clsx from 'clsx';

// I removed the 'title' prop since the Header is gone.
const AllLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-[#F0F7F5]">
            {/* Sidebar remains common */}
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div
                className={clsx(
                    "flex-1 flex flex-col transition-all duration-300",
                    // Adjusts margin based on sidebar state
                    isSidebarOpen ? "ml-64" : "ml-20"
                )}
            >
                {/* Main Content Area - This is where your page content goes */}
                <main className="flex-1 p-4 overflow-y-auto">
                    {children}
                </main>

                {/* Footer remains common */}
                <Footer />
            </div>
        </div>
    );
};

export default AllLayout;


