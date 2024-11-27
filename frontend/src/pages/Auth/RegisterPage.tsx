import React from 'react'
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

import "./customFonts.css"
const RegisterPage = () => {

    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const [passwordError, setPasswordError] = React.useState('');
    const [nameError, setNameError] = React.useState('');
    const [emailError, setEmailError] = React.useState('');

    const navigate = useNavigate();

    const { signup, error, isLoading } = useAuthStore();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        const namePattern = /^[a-zA-Z\s]+$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        // Validate name
        if (!namePattern.test(name)) {
            setNameError('Name can only contain letters and spaces');
            return;
        } else {
            setNameError('');
        }

        // Validate email
        if (!emailPattern.test(email)) {
            setEmailError('Invalid email address');
            return;
        } else {
            setEmailError('');
        }

        // Validate password
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
            await signup(email, password, name);
            navigate("/verify-email");
        } catch (error) {
            console.log(error);
        }

    };

    return (

        <div className='flex flex-row min-h-screen overflow-hidden'>
            <div className='flex flex-col w-1/2'>
                <a href="/" className='flex flex-row'>
                    <img src="/Logo.png" alt="logo" width={120} height={120} />
                    <h1 className='text-3xl font-rowdies py-8'> VisuGrow </h1>
                </a>
                <div className='flex justify-center items-center h-4/5'>
                    <img src="/banner.png" alt="banner" />
                </div>
            </div>

            <div className='flex flex-col w-1/2 justify-center items-center min-h-screen customBackground'>
                <form onSubmit={handleSignUp} className='flex flex-col bg-white p-4 w-3/4 rounded-lg '>
                    <h1 className='text-3xl font-rowdies py-8 text-center'> Sign Up </h1>
                    <label className='text-l font-poppins py-2'> Name </label>
                    <input
                        className='border-2 border-gray-300 rounded-md p-2'
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    {nameError && <p className='text-red-500 text-sm font-poppins'>{nameError}</p>}
                    <label className='text-l font-poppins py-2'> Email </label>
                    <input
                        className='border-2 border-gray-300 rounded-md p-2'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {emailError && <p className='text-red-500 text-sm font-poppins'>{emailError}</p>}
                    <label className='text-l font-poppins py-2'> Password </label>
                    <input
                        className='border-2 border-gray-300 rounded-md p-2'
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label className='text-l font-poppins py-2'> Confirm Password </label>
                    <input
                        className='border-2 border-gray-300 rounded-md p-2'
                        type='password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    {passwordError && <p className='text-red-500 text-sm font-poppins'>{passwordError}</p>}
                    {error && <p className='text-red-500 text-sm font-poppins'>{error}</p>}

                    <button className='customColorButton text-white text-xl py-2 rounded-3xl mt-4 w-1/3 self-center'> {isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : "Sign Up"} </button>
                    <p className='py-5 text-center font-poppins'>
                        Already a member?
                        <span className="font-bold ml-1">
                            <a href="/login" className='hover:underline'>Sign in</a>
                        </span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage