import React, { useState } from 'react';
import { Loader, LogOut, LayoutDashboard, FilePlus, ChartBar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarProps {
    isLoading: boolean;
    error: string | null;
    handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isLoading, error, handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    
    const isActive = (path: string) => location.pathname === path;
    
    const navigationItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboard size={20} />,
        },
        {
            name: 'Data',
            path: '/upload',
            icon: <FilePlus size={20} />,
        },
        {
            name: 'Visualization',
            path: '/visualization',
            icon: <ChartBar size={20} />,
        },
    ];

    return (
        <motion.div 
            className={`bg-[#053252] relative flex flex-col h-screen  text-white ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Collapse toggle button */}
            <button 
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20  rounded-full p-1 shadow-lg z-10"
                style={{ backgroundColor: '#4A8CBB' }}
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        
            {/* Logo area */}
            <div className={`flex items-center justify-center py-6 border-b border-gray-700 ${collapsed ? 'px-2' : 'px-6'}`}>
                {collapsed ? (
                    <div className="rounded-full flex items-center justify-center font-bold text-xl">
                        <img src="./mark.png" alt=""/>
                    </div>
                ) : (
                    <a href="/">
                    <img src="/Logo.png" alt="VisuGrow" className="max-w-[180px]" />
                    </a>
                )}
            </div>
            
            {/* Navigation links */}
            <div className="flex-1 py-8">
                <div className="space-y-2 px-3">
                    {navigationItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} 
                                px-4 py-3 rounded-lg transition-all duration-200
                                ${isActive(item.path) 
                                    ? 'bg-[#4A8CBB] text-white shadow-md' 
                                    : 'text-gray-300 hover:text-white'}`}
                        >
                            <div className={`${isActive(item.path) ? 'text-white' : 'text-gray-400'}`}>
                                {isLoading && isActive(item.path) ? 
                                    <Loader className='animate-spin' size={20} /> : 
                                    item.icon}
                            </div>
                            
                            {!collapsed && (
                                <span className={`ml-3 font-medium ${isActive(item.path) ? 'text-white' : ''}`}>
                                    {item.name}
                                </span>
                            )}
                            
                            {!collapsed && isActive(item.path) && (
                                <motion.div 
                                    className="w-1.5 h-8 bg-white absolute right-3 rounded-full"
                                    layoutId="activeIndicator"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Error messages */}
            {error && !collapsed && (
                <div className="px-4 py-2 mx-4 mb-4 bg-red-500/20 border border-red-500 rounded-md text-sm text-red-200">
                    {error}
                </div>
            )}
            
            {/* Logout button */}
            <div className="p-4 border-t border-gray-700">
                <button 
                    onClick={handleLogout}
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} 
                        px-4 py-3 rounded-lg transition-all duration-200
                        bg-[#053252]  text-gray-300 hover:text-white`}
                >
                    <div className="text-gray-400">
                        {isLoading ? <Loader className='animate-spin' size={20} /> : <LogOut size={20} />}
                    </div>
                    
                    {!collapsed && (
                        <span className="ml-3 font-medium">Sign Out</span>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;