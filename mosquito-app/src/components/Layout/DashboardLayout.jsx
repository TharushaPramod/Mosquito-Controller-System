import React from 'react';
import Header from './Header';
import Footer from './Footer';
import NavigationTabs from './NavigationTabs';

const DashboardLayout = ({ children, title }) => {
    return (
        <div className="flex flex-col min-h-screen bg-[#F0F7F5]">
            <Header title={title} />
            <NavigationTabs />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default DashboardLayout;
