import SheetIcon from '../../Icons/SheetIcon'
import StoreIcon from '../../Icons/StoreIcon'
import UploadIcon from '../../Icons/UploadIcon'

import { Loader, LogOut } from 'lucide-react'


import './custom.css'
import { useAuthStore } from '../../store/authStore'
const UploadDataPage = () => {

    const { logout, isLoading, error } = useAuthStore();

    const handleLogout = () => {
        logout();
    }
    return (
        <div className='flex flex-row min-h-screen '>
            <div className='flex flex-col sidebar min-w-fit justify-between'>
                <a href="/" className='flex flex-row items-start mr-5'>
                    <img src="/Logo.png" alt="logo" width={110} height={110} />
                    <h1 className='text-2xl font-rowdies py-8 '> VisuGrow </h1>
                </a>
                {error && <p className='text-red-500 text-sm font-poppins'>{error}</p>}
                <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 flex flex-row gap-2' onClick={handleLogout}> {
                    isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : <LogOut /> 
                } <span> Sign Out</span> </button>
            </div>

            <div className='flex flex-col min-h-screen w-full mainCenter'>
                <h1 className='text-3xl font-rowdies text-center py-8'> Upload Data </h1>
                <div className='flex flex-row justify-center items-center'>
                    <form className='flex flex-row bg-white p-4 w-3/4 min-w-fit rounded-2xl border-2  border-black py-10' >
                        <UploadIcon/>
                        <div className='flex flex-col w-3/4'>
                            <label className='text-xl font-rowdies py-2'> Upload Data </label>
                            <input
                                className='border-2 border-dotted border-gray-300 rounded-md p-2'
                                type='file'
                                accept='.csv , .json , .xlsx'
                            />
                        </div>
                        <div className='flex flex-col w-1/4 justify-center items-center'>
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 '> Upload </button>
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 '> Clear </button>
                        </div>
                    </form>
                </div>
                <div className='flex flex-row justify-center items-center pt-5'>
                    <div className='flex flex-row bg-white p-4 w-3/4 rounded-2xl border-2  border-black min-w-fit py-10 ' >
                        <SheetIcon />
                        <div className='flex flex-col w-3/4  '>
                            <label className='text-xl font-rowdies py-2'> In-App Data Entry Sheet </label>
                            <div className='flex flex-row border-2 border-dotted border-gray-300 rounded-md p-2 justify-center gap-5 '>
                                <h1 className='text-l font-rowdies text-center'> Dont have <br />any data?</h1>
                                <h1 className='text-l font-rowdies text-center'> Use Our In-App Data <br /> Entry Sheet</h1>
                            </div>
                        </div>
                        <div className='flex flex-col w-1/4 justify-center items-center'>
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 '> Open </button>
                        </div>
                    </div>
                </div>
                <div className='flex flex-row justify-center items-center pt-5'>
                    <div className='flex flex-row bg-white p-4 w-3/4 rounded-2xl border-2  border-black min-w-fit py-10' >
                        <StoreIcon />
                        <div className='pl-3 flex flex-col w-3/4'>
                            <label className='text-xl font-rowdies py-2'> E-commerce Platfrom Integration </label>
                            <div className='flex flex-row border-2 border-dotted border-gray-300 rounded-md p-2 justify-center gap-5'>
                                <h1 className='text-l font-rowdies text-center'> Have an <br />Ecommerce Store?</h1>
                                <h1 className='text-l font-rowdies text-center'> Integrate With <br />VisuGrow Now!</h1>
                            </div>
                        </div>
                        <div className='flex flex-col w-1/4 justify-center items-center'>
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 '> Integerate </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadDataPage