import React from 'react'

const ChangePassword = () => {
    return (
        <div className='flex flex-row'>
            <div className='flex flex-col w-1/2 justify-center items-center min-h-screen customBackground'>
                <form className='flex flex-col bg-white p-4 w-3/4 rounded-lg' >
                    <h1 className='text-3xl font-rowdies py-8 text-center'> Reset <br /> Password </h1>
                    <label className='text-l font-sans py-2'> New Password </label>
                    <input type='password' className='border-2 border-gray-300 rounded-md p-2' />
                    <label className='text-l font-sans py-2'> Confirm Password </label>
                    <input type='password' className='border-2 border-gray-300 rounded-md p-2' />
                    <button className='customColorButton text-white text-xl py-2 rounded-3xl mt-4 mb-8 w-1/2 self-center'> Sign In </button>
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