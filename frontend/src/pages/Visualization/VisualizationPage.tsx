import Sidebar from '../../components/SideBar';
import { useAuthStore } from '../../store/authStore';

const VisualizationPage = () => {
    const { logout } = useAuthStore();
    return (
        <div className='flex flex-row min-h-screen'>
            <Sidebar isLoading={false} error={null} handleLogout={() => { logout }} />
            <div className='flex flex-col min-h-screen w-full mainCenter' >
            
            </div>
            <div className='flex flex-col min-h-screen w-1/6 rounded-lg border-2 border-black sidebar'>
            
            </div>
            <div className='flex flex-col min-h-screen w-1/6 sidebar rounded-lg border-2 border-black  '>
            
            </div>

        </div>
    )
}

export default VisualizationPage