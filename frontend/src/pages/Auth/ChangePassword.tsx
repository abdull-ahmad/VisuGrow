import React from 'react'
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const ChangePassword = () => {

    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const [passwordError, setPasswordError] = React.useState('');

    const { resetPassword, error, isLoading } = useAuthStore();

    const { token } = useParams();
    const navigate = useNavigate();

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!passwordPattern.test(password)) {
            setPasswordError('Password must be at least 8 characters long and contain both letters and numbers');
            return;
        } else {
            setPasswordError('');
        }

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        try {
            await resetPassword(password, token);
            toast.success("Password Changed Successfully , Redirecting to login page")
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.log(error);
        }

    }

    return (
        <div className='flex flex-row'>
            <div className='flex flex-col w-1/2 justify-center items-center min-h-screen customBackground'>
                <form onSubmit={handleChangePassword} className='flex flex-col bg-white p-4 w-3/4 rounded-lg' >
                    <h1 className='text-3xl font-rowdies py-8 text-center'> Reset <br /> Password </h1>
                    <label className='text-l font-poppins py-2'> New Password </label>
                    <input
                        className='border-2 border-gray-300 rounded-md p-2'
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <label className='text-l font-poppins py-2'> Confirm Password </label>
                    <input
                        className='border-2 border-gray-300 rounded-md p-2'
                        type='password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {passwordError && <p className='text-red-500 text-sm font-poppins'>{passwordError}</p>}
                    {error && <p className='text-red-500 text-sm font-poppins'>{error}</p>}
                    <button className='customColorButton text-white text-xl py-2 rounded-3xl mt-4 mb-8 w-1/2 self-center'> {isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : "Verify"}  </button>
                </form>
            </div>

            <div className='flex flex-col w-1/2 px-5'>
                <div className='flex flex-row justify-end'>
                    <img src="/Logo.png" alt="logo" width={120} height={120} />
                    <h1 className='text-3xl font-rowdies py-8'> VisuGrow </h1>
                </div>
            </div>


        </div>
    )
}

export default ChangePassword