import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, updateProfile, changePassword , error } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passerror, setPassError] = useState<string | null>(null);
    const [nameerror, setNameError] = useState<string | null>(null);

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
    const nameRegex = /^[a-zA-Z\s]+$/;

    const handleUpdateProfile = async () => {
        if (!name) {
            setNameError('Name field cannot be empty.');
            return;
        }
        if (!nameRegex.test(name)) {
            setNameError('Name can only contain letters and spaces.');
            return;
        }

        try {
            await updateProfile(name);
            toast.success('Name updated successfully');
            onClose();
        } catch (error) {
            console.error('Failed to update profile', error);
            setNameError('Failed to update profile.');
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            setPassError('Please fill in all fields.');
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            setPassError('Password must be at least 8 characters long and include at least one letter and one number.');
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            onClose();
        } catch (error) {
            console.error('Failed to change password', error);
            setPassError('Failed to change password.');
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className='flex flex-row justify-between '>
                    <h2 className="text-2xl mb-2 font-rowdies">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-red-600 text-xl pb-2"
                    >
                        &times; 
                    </button>
                </div>
                <div className="mb-4">
                    <label className="font-poppins block">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                    
                    {nameerror && <p className="text-red-500 text-sm mt-2">{nameerror}</p>}
                    <div className='flex justify-end'>
                        <button
                            onClick={handleUpdateProfile}
                            disabled = {name === user?.name}
                            className="customColorButton font-rowdies text-white  mt-2 px-4 py-2 rounded-lg"
                        >
                            Update Name
                        </button>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="font-poppins block">Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"

                    />
                </div>
                <div className="mb-4">
                    <label className=" font-poppins block">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                    <div className='flex justify-end'>
                        <button
                            onClick={handleChangePassword}
                            className="customColorButton font-rowdies text-white px-4 py-2 mt-2 rounded-lg"
                        >
                            Change Password
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    {passerror && <p className="text-red-500 text-sm mt-2">{passerror}</p>}
                </div>

            </div>
        </div>
    );
};

export default ProfileModal;