import React, { useEffect, useState } from 'react';
import { Loader, LogOut, CircleUserRound, Trash2, Store } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { DataSheetGrid } from 'react-datasheet-grid';
import Modal from '../../components/Modal';

const DashboardPage = () => {
    const { logout, isLoading, error, user } = useAuthStore();
    const { files, viewFile, deleteFile, openFile, isFileLoading, fileerror, fileData, fileHeaders } = useDataStore();

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        viewFile();
    }, [viewFile]);

    const handleFileClick = async (fileName: string) => {
        await openFile(fileName);
        console.log(fileData , fileHeaders);
        setIsModalOpen(true);
    };

    const handleDelete = async (fileName: string) => {
        await deleteFile(fileName);
        viewFile();
    };

    const handleLogout = async () => { logout(); }

    return (
        <div className='flex flex-row min-h-screen '>
            <div className='flex flex-col sidebar min-w-fit justify-between'>
                <a href="/" className='flex flex-row items-start mr-5'>
                    <img src="/Logo.png" alt="logo" />
                </a>
                {error && <div className='text-red-500 text-center'> {error} </div>}
                <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 flex flex-row gap-2 justify-center mb-5' onClick={handleLogout}> {
                    isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : <LogOut />
                } <span> Sign Out</span> </button>
            </div>
            <div className='flex flex-col min-h-screen w-full mainCenter'>
                <h1 className='text-5xl font-rowdies text-center py-8'> User Dashboard </h1>
                <h1 className='text-4xl font-rowdies text-start px-5'> Welcome Back!</h1>
                <div className='flex flex-col justify-center items-center h-1/4 w-1/6 bg-white rounded-3xl shadow-lg m-5 p-5'>
                    <CircleUserRound
                        strokeWidth={1.3}
                        size={80} />
                    <h1 className='text-2xl font-poppins text-center px-5'> {user.name} </h1>
                    <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 flex flex-row gap-2 justify-center'> Edit Profile
                    </button>
                </div>
                <div className='flex flex-col h-auto w-3/4 bg-white rounded-3xl shadow-lg m-5 p-5'>
                    <h1 className='text-3xl font-rowdies text-start px-5 mb-5'> Uploaded Files </h1>
                    {isFileLoading ? (
                        <Loader className='animate-spin mx-auto' size={24} />
                    ) : fileerror ? (
                        <p className='text-red-500'>{fileerror}</p>
                    ) : (
                        <ul className='file-list'>
                            {files.map((file, index) => (
                                <li key={file._id} className={`file-item ${index % 2 === 0 ? 'bg-custom' : 'bg-white'} border-b py-2 flex justify-between items-center`}>
                                    <div className='flex flex-col font-poppins' onClick={() => handleFileClick(file.name)}>
                                        <span>{file.name}</span>
                                        <span className='text-sm text-gray-500'>{new Date(file.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <Trash2 className='cursor-pointer text-red-500' onClick={() => handleDelete(file.name)} />
                                </li>
                            ))}
                        </ul>
                    )}
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                        {fileData && fileHeaders && (
                            <DataSheetGrid
                                value={fileData}
                                
                                columns={fileHeaders.map(header  => ({
                                    title: header.title,
                                    type: header.type,
                                }))}
                            />
                        )}
                    </Modal>
                </div>

                <div className='flex flex-row'>
                    <div className='flex flex-col justify-center items-center  w-1/6 bg-white rounded-3xl shadow-lg m-5 p-5'>
                        <Store
                            strokeWidth={1.3}
                            size={80} />
                        <h1 className='text-2xl font-poppins text-center px-5'> Store Name </h1>
                        <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 flex flex-row gap-2 justify-center'> Edit Store
                        </button>
                    </div>
                    <div className='flex flex-col justify-center items-center w-1/3 bg-white rounded-3xl shadow-lg m-5 p-3    '>
                        <h1 className='text-2xl font-poppins text-center px-5 mb-5'> Need help with Integration?</h1>
                        <div className='flex flex-row  justify-center items-center gap-5'>
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 flex flex-row gap-2 justify-center'> Instructions </button>
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-72 flex flex-row gap-2 justify-center'> Integerate Store </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage;