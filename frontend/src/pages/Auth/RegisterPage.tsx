import React from 'react'
import "./customFonts.css"
const RegisterPage = () => {
    return (

        <div className='flex flex-row min-h-screen overflow-hidden'>
            <div className='flex flex-col w-1/2'>
                <div className='flex flex-row'>
                    <img src="/Logo.png" alt="logo" width={120} height={120} />
                    <h1 className='text-3xl font-rowdies py-8'> VisuGrow </h1>
                </div>
                <div className='flex justify-center items-center h-4/5'>
                    <img src="/banner.png" alt="banner" />
                </div>
            </div>

            <div className='flex flex-col w-1/2 justify-center items-center min-h-screen customBackground'>
                <form className='flex flex-col bg-white p-4 w-3/4 rounded-lg ' >
                    <h1 className='text-3xl font-rowdies py-8 text-center'> SignUp </h1>
                    <label className='text-l font-sans py-2'> Name </label>
                    <input type='text' className='border-2 border-gray-300 rounded-md p-2' />
                    <label className='text-l font-sans py-2'> Email </label>
                    <input type='email' className='border-2 border-gray-300 rounded-md p-2' />
                    <label className='text-l font-sans py-2'> Password </label>
                    <input type='password' className='border-2 border-gray-300 rounded-md p-2' />
                    <label className='text-l font-sans py-2'> Confirm Password </label>
                    <input type='password' className='border-2 border-gray-300 rounded-md p-2' />
                    <button className='customColorButton text-white text-xl py-2 rounded-3xl mt-4 w-1/2 self-center'> Sign Up </button>
                    <p className='py-5 text-center'>
                        Already a member?
                        <span className="font-bold ml-1">
                            <a href="/login">Login</a>
                        </span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage