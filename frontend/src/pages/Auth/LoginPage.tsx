import React from 'react'
import { Loader } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const navigate = useNavigate();

    const { isLoading, error ,login } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate("/");
        }
        catch (error) {
            console.log(error);
        }
    }


    return (
        <div className='flex flex-row'>
            <div className='flex flex-col w-1/2 justify-center items-center min-h-screen customBackground'>
                <form onSubmit={handleLogin} className='flex flex-col bg-white p-4 w-3/4 rounded-lg' >
                    <h1 className='text-3xl font-rowdies py-8 text-center'> Sign In </h1>
                    <label className='text-l font-poppins py-2'> Email </label>
                    <input
                        className='border-2 border-gray-300 rounded-md p-2'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className='text-l font-poppins py-2'> Password </label>
                    <input
                        className='border-2 border-gray-300 rounded-md p-2'
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className='text-red-500 text-sm'>{error}</p>}

                    <button 
                    className='customColorButton text-white text-xl py-2 rounded-3xl mt-4 w-1/3 self-center'
                    disabled={isLoading}    
                    > {isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : "Sign In"} </button>
                    <div className='py-5 text-center flex flex-col gap-3'>
                        <p className=' font-poppins'>
                            Trouble Signing In?
                            <span className="font-bold ml-1">
                                <a href="/forgot" className='hover:underline'>Click Here</a>
                            </span>
                        </p>
                        <p className="font-bold font-poppins">OR</p>
                        <p className='font-poppins'>
                            Not a Member?
                            <span className="font-bold ml-1 ">
                                <a href="/register" className='hover:underline'>Sign Up</a>
                            </span>
                        </p>
                    </div>
                </form>
            </div>

            <div className='flex flex-col w-1/2 px-5'>
                <div className='flex flex-row justify-end'>
                    <img src="/Logo.png" alt="logo" width={120} height={120} />
                    <h1 className='text-3xl font-rowdies py-8'> VisuGrow </h1>
                </div>

                <div className='flex justify-center items-center h-4/5'>
                    <img src="/banner.png" alt="banner" />
                </div>
            </div>


        </div>
    )
}

export default LoginPage