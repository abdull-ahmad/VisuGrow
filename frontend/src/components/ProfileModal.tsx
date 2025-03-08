import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, X, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, updateProfile, changePassword, error } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passerror, setPassError] = useState<string | null>(null);
    const [nameerror, setNameError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setName(user?.name || '');
            setCurrentPassword('');
            setNewPassword('');
            setPassError(null);
            setNameError(null);
        }
    }, [isOpen, user]);

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
    const nameRegex = /^[a-zA-Z\s]+$/;

    const handleUpdateProfile = async () => {
        setNameError(null);
        if (!name) {
            setNameError('Name field cannot be empty.');
            return;
        }
        if (!nameRegex.test(name)) {
            setNameError('Name can only contain letters and spaces.');
            return;
        }

        try {
            setLoading(true);
            await updateProfile(name);
            toast.success('Profile updated successfully', {
                icon: '👤',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
            setTimeout(onClose, 1000);
        } catch (error) {
            console.error('Failed to update profile', error);
            setNameError('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setPassError(null);
        if (!currentPassword || !newPassword) {
            setPassError('Please fill in all fields.');
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            setPassError('Password must be at least 8 characters long and include at least one letter and one number.');
            return;
        }

        try {
            setLoading(true);
            await changePassword(currentPassword, newPassword);
            toast.success('Password changed successfully', {
                icon: '🔒',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                }
            });
            setCurrentPassword('');
            setNewPassword('');
            setTimeout(onClose, 1000);
        } catch (error) {
            console.error('Failed to change password', error);
            setPassError('Current password is incorrect or an error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with gradient background */}
                        <div className="bg-gradient-to-r from-[#053252] to-[#1e5b8a] text-white p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                                        <User size={20} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Edit Profile</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-white bg-white bg-opacity-20 hover:bg-opacity-30 p-1.5 rounded-full transition-all"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <p className="mt-2 text-blue-100 opacity-80">
                                Update your personal information and password
                            </p>
                        </div>

                        {/* Tab navigation */}
                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 py-3 px-4 font-medium text-sm relative ${
                                    activeTab === 'profile' 
                                        ? 'text-blue-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <span className="flex items-center justify-center">
                                    <User size={16} className="mr-2" />
                                    Profile Details
                                </span>
                                {activeTab === 'profile' && (
                                    <motion.div 
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        layoutId="tabIndicator"
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex-1 py-3 px-4 font-medium text-sm relative ${
                                    activeTab === 'security' 
                                        ? 'text-blue-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <span className="flex items-center justify-center">
                                    <Lock size={16} className="mr-2" />
                                    Security
                                </span>
                                {activeTab === 'security' && (
                                    <motion.div 
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        layoutId="tabIndicator"
                                    />
                                )}
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'profile' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <User size={16} className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            
                                            {nameerror && (
                                                <div className="mt-2 flex items-center text-red-600 text-sm">
                                                    <AlertCircle size={14} className="mr-1.5 flex-shrink-0" />
                                                    <span>{nameerror}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <div className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500">
                                                {user?.email || 'email@example.com'}
                                            </div>
                                            <p className="mt-1.5 text-xs text-gray-500">
                                                Email cannot be changed
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={loading || name === user?.name}
                                            className={`flex items-center px-6 py-2.5 rounded-lg font-medium ${
                                                loading || name === user?.name
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-[#053252] text-white hover:bg-[#0a4470] transition-colors'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                    </svg>
                                                    Updating...
                                                </>
                                            ) : "Update Profile"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Lock size={16} className="text-gray-400" />
                                                </div>
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Lock size={16} className="text-gray-400" />
                                                </div>
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            
                                            {passerror && (
                                                <div className="mt-2 flex items-start text-red-600 text-sm">
                                                    <AlertCircle size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                                                    <span>{passerror}</span>
                                                </div>
                                            )}
                                            
                                            <div className="mt-2 text-xs text-gray-500">
                                                Password must be at least 8 characters and include letters and numbers
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={loading || !currentPassword || !newPassword}
                                            className={`flex items-center px-6 py-2.5 rounded-lg font-medium ${
                                                loading || !currentPassword || !newPassword
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-[#053252] text-white hover:bg-[#0a4470] transition-colors'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                    </svg>
                                                    Updating...
                                                </>
                                            ) : "Change Password"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;