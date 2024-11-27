import React from 'react'
import { ArrowLeftIcon, Mail, Loader } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';


const ForgotPassword = () => {

    const [email, setEmail] = React.useState('');

    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const { isLoading, error, forgotPassword } = useAuthStore();


    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await forgotPassword(email);
            setIsSubmitted(true);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='flex flex-row'>
            <div className='flex flex-col w-1/2 justify-center items-center min-h-screen customBackground'>
                <form onSubmit={handleForgotPassword} className='flex flex-col bg-white p-4 w-3/4 rounded-lg' >
                    <h1 className='text-3xl font-rowdies py-8 text-center'> Forgot <br /> Password?  </h1>
                    {!isSubmitted ? (
                        <div className='flex flex-col '>
                            <label className='text-l font-poppins py-2'> Email </label>
                            <input
                                className='border-2 border-gray-300 rounded-md p-2'
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {error && <p className='text-red-500 text-sm font-poppins'>{error}</p>}
                            <button className='customColorButton text-white text-xl py-2 rounded-3xl mt-4 w-1/2 self-center'> {isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : "Send Link"} </button>
                            <div className='py-5 text-center flex flex-col gap-3'>
                                <p className='font-poppins'>
                                    Not a Member?
                                    <span className="font-bold ml-1">
                                        <a href="/RegisterPage" className='hover:underline'>Sign Up</a>
                                    </span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center'>
                            <div className='customColorButton rounded-full h-16 w-16 flex items-center justify-center mx-auto'>
                                <Mail className='h-8 w-8 text-white' />
                            </div>
                            <p className='customColorText text-2xl font-bold py-2 font-poppins'> Email Sent Successfully </p>
                            <p className='text-black text-lg font-poppins'> Please check {email} for the password reset link </p>
                            <a href="/login" className='customColorText text-xl pt-7 hover:underline' >
                                <ArrowLeftIcon className='h-6 w-6 inline-block' /> Back to Login
                            </a>
                        </div>
                    )
                    }
                </form>
            </div>

            <div className='flex flex-col w-1/2 px-5'>
                <div className='flex flex-row justify-end'>
                    <img src="/Logo.png" alt="logo" width={120} height={120} />
                    <h1 className='text-3xl font-rowdies py-8'> VisuGrow </h1>
                </div>
                <div className='flex justify-center items-center h-4/5'>
                    <img src="/forgotBanner.png" alt="banner" />
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword