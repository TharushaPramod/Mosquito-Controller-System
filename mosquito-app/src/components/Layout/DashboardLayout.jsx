import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import NavigationTabs from './NavigationTabs';
import clsx from 'clsx';

const DashboardLayout = ({ children, title, hideHeaderTitle, hideHeaderDateTime }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-[#F0F7F5]">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div
                className={clsx(
                    "flex-1 flex flex-col transition-all duration-300",
                    isSidebarOpen ? "ml-64" : "ml-20"
                )}
            >
                <Header title={hideHeaderTitle ? null : title} hideDateTime={hideHeaderDateTime} />
                <NavigationTabs />
                <main className="flex-1 p-4 overflow-y-auto">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default DashboardLayout;
