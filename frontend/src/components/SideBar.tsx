import { Loader, LogOut, LayoutDashboard, File, ChartSpline } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface SidebarProps {
    isLoading: boolean;
    error: string | null;
    handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isLoading, error, handleLogout }) => {
    const navigate = useNavigate();

    return (
        <div className='flex flex-col sidebar min-w-fit justify-between'>
            <a href="/" className='flex flex-row items-start mr-5'>
                <img src="/Logo.png" alt="logo" width={250} />
            </a>

            <div className='justify-center items-center flex flex-col'>
                <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4 flex flex-row gap-2 justify-center mb-5' onClick={() => navigate('/dashboard')}> {
                    isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : <LayoutDashboard />
                } <span> Dashboard</span> </button>
                <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4 flex flex-row gap-2 justify-center mb-5' onClick={() => navigate('/upload')}> {
                    isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : <File />
                } <span> Data</span> </button>
                <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4 flex flex-row gap-2 justify-center mb-5' onClick={() => navigate('/visualization')}> {
                    isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : <ChartSpline />
                } <span> Visualization </span> </button>
            </div>
            {error && <div className='text-red-500 text-center'> {error} </div>}
            <div className="flex justify-center items-center">
                <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4 flex flex-row gap-2 justify-center mb-5' onClick={handleLogout}>
                    {isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : <LogOut />}
                    <span> Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;