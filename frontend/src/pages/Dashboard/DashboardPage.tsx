import { useEffect, useState } from 'react';
import { Loader, CircleUserRound, Trash2, Store, FileText, Clock, Calendar, Search, AlertTriangle, Eye, ExternalLink, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { useEcomStore } from '../../store/ecomStore';
import { DataSheetGrid, Column, keyColumn, textColumn, intColumn, percentColumn, dateColumn } from 'react-datasheet-grid';
import Modal from '../../components/Modal/Modal';
import StoreModal from '../../components/EcomStore/StoreModal';
import toast from 'react-hot-toast';
import Sidebar from '../../components/SideBar';
import ProfileModal from '../../components/Modal/ProfileModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


type RowData = { [key: string]: string | number | Date | null; };

interface Header {
    title: string;
    type: 'text' | 'number' | 'percent' | 'date';
}

const DashboardPage = () => {
    const { logout, isLoading, error, user } = useAuthStore();
    const { files, viewFile, deleteFile, openFile, editFile, isFileLoading, fileerror, fileData, fileHeaders } = useDataStore();
    const [fileId, setFileId] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [replaceValue, setReplaceValue] = useState('');
    const [isSearchReplaceOpen, setIsSearchReplaceOpen] = useState(false);
    const [rowData, setRowData] = useState<RowData[]>([]);
    const [colDefs, setColDefs] = useState<Column<RowData>[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nullCount, setNullCount] = useState(0);
    const [fileSearchQuery, setFileSearchQuery] = useState('');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('files');
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const { stores, isLoading: isStoresLoading, fetchStores, deleteStore } = useEcomStore();

    const navigate = useNavigate();

    useEffect(() => {
        viewFile();
    }, [viewFile]);

    useEffect(() => {
        if (activeTab === 'integrations') {
            fetchStores();
        }
    }, [activeTab, fetchStores]);


    useEffect(() => {
        if (fileData && fileHeaders) {
            const columns = fileHeaders.map((header: Header) => createColumn(header.title, header.type));
            const rows = mapRowData(fileData, fileHeaders);
            setColDefs(columns);
            setRowData(rows);
        }
    }, [fileData, fileHeaders]);

    const handleEditProfileClick = () => {
        setIsProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
    };

    const handleFileClick = async (fileId: string) => {
        setFileId(fileId);
        await openFile(fileId);
        setIsModalOpen(true);
    };

    const handleDelete = async (fileId: string) => {
        // Confirmation dialog with custom styling
        if (confirm("Are you sure you want to delete this file?")) {
            await deleteFile(fileId);
            viewFile();
            toast.success('File deleted successfully', {
                style: { background: '#333', color: '#fff' }
            });
        }
    };

    const handleSearchReplace = () => {
        setIsSearchReplaceOpen(true);
    };

    const handleSearchReplaceSubmit = () => {
        const updatedRowData = rowData.map(row => {
            const updatedRow = { ...row };
            Object.keys(updatedRow).forEach(key => {
                if (updatedRow[key] === searchValue) {
                    updatedRow[key] = replaceValue;
                }
            });
            return updatedRow;
        });
        setRowData(updatedRowData);
        setIsSearchReplaceOpen(false);
    };

    const getColumnType = (column: Column): 'text' | 'number' | 'percent' | 'date' => {
        const columnStr = JSON.stringify(column);
        if (columnStr.includes(JSON.stringify(intColumn))) return 'number';
        if (columnStr.includes(JSON.stringify(percentColumn))) return 'percent';
        if (columnStr.includes(JSON.stringify(dateColumn))) return 'date';
        return 'text';
    };

    const handleFileSave = async () => {
        try {
            const columnInfo = colDefs.map(col => ({
                title: col.title,
                type: getColumnType(col)
            }));

            await editFile({
                rows: rowData,
                columns: columnInfo,
                fileId: fileId || ''
            });

            toast.success('File saved successfully!', {
                style: { background: '#333', color: '#fff' }
            });
        } catch (error) {
            console.error('Error saving file:', error);
            toast.error('Failed to save file', {
                style: { background: '#333', color: '#fff' }
            });
        }
    };

    const handleLogout = async () => { logout(); }

    const createColumn = (name: string, type: 'text' | 'number' | 'percent' | 'date'): Column => {
        switch (type) {
            case 'number':
                return { ...keyColumn(name, intColumn), title: name };
            case 'percent':
                return { ...keyColumn(name, percentColumn), title: name };
            case 'date':
                return { ...keyColumn(name, dateColumn), title: name };
            default:
                return { ...keyColumn(name, textColumn), title: name };
        }
    };

    const mapRowData = (rows: any[], headers: any[]) => {
        return rows.map(row => {
            const mappedRow: { [key: string]: any } = {};
            headers.forEach(header => {
                let cellValue = row[header.title];
                if (header.type === 'percent' && typeof cellValue === 'string' && cellValue.endsWith('%')) {
                    cellValue = parseFloat(cellValue.slice(0, -1)) / 100;
                } else if (header.type === 'date' && typeof cellValue === 'string' && !isNaN(Date.parse(cellValue))) {
                    cellValue = new Date(cellValue);
                    cellValue.setHours(12); // Set to noon
                } else if (header.type === 'number' && typeof cellValue === 'string' && !isNaN(Number(cellValue))) {
                    cellValue = Number(cellValue);
                }
                mappedRow[header.title] = cellValue !== undefined && cellValue !== '' ? cellValue : null;
            });
            return mappedRow;
        });
    };

    const countNullValues = (data: RowData[]) => {
        let count = 0;
        data.forEach(row => {
            Object.values(row).forEach(value => {
                if (value === null) {
                    count++;
                }
            });
        });
        return count;
    };

    useEffect(() => {
        setNullCount(countNullValues(rowData));
    }, [rowData]);

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
    );

    const handleConnectStore = () => {
        setIsStoreModalOpen(true);
    };

    const handleStoreConnected = () => {
        fetchStores();
    };

    const handleDisconnectStore = async (storeId: string) => {
        if (confirm("Are you sure you want to disconnect this store?")) {
            await deleteStore(storeId);
        }
    };

    return (
        <div className='flex h-screen bg-[#4a8cbb1b]'>
            <Sidebar isLoading={isLoading} error={error} handleLogout={handleLogout} />

            <div className='flex-1 overflow-auto'>
                {/* Header */}
                <header className='bg-[#4a8cbb1b] shadow-sm px-8 py-6'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-3xl font-rowdies text-gray-800'>Dashboard</h1>
                            <p className='text-gray-500 mt-1 font-poppins'>Welcome back, {user?.name || 'User'}!</p>
                        </div>

                        <button
                            onClick={handleEditProfileClick}
                            className='flex items-center gap-2 bg-[#053252] text-white hover:bg-opacity-90 transition-all px-4 py-2 rounded-lg text-sm font-poppins shadow-sm'
                        >
                            <CircleUserRound size={18} />
                            Edit Profile
                        </button>
                    </div>
                </header>

                {/* Main content */}
                <div className='max-w-7xl mx-auto px-6 py-8 '>
                    {/* Quick stats */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'
                        >
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm text-gray-500 font-poppins'>Total Files</p>
                                    <h3 className='text-2xl font-bold mt-1'>{files.length}</h3>
                                </div>
                                <div className='h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center'>
                                    <FileText size={20} className='text-blue-600' />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'
                        >
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm text-gray-500 font-poppins'>Recent Upload</p>
                                    <h3 className='text-lg font-bold mt-1 truncate max-w-[180px]'>
                                        {files.length > 0 ? files[0].name : 'No files'}
                                    </h3>
                                </div>
                                <div className='h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center'>
                                    <Clock size={20} className='text-purple-600' />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'
                        >
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm text-gray-500 font-poppins'>Last Activity</p>
                                    <h3 className='text-lg font-bold mt-1'>
                                        {files.length > 0 ?
                                            new Date(files[0].createdAt).toLocaleDateString() :
                                            'No activity'}
                                    </h3>
                                </div>
                                <div className='h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center'>
                                    <Calendar size={20} className='text-amber-600' />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Tab navigation */}
                    <div className='flex border-b border-gray-200 mb-6'>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`px-4 py-3 font-poppins text-sm transition-all relative
                                ${activeTab === 'files' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Data Files
                            {activeTab === 'files' && (
                                <motion.div
                                    className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600'
                                    layoutId="activeTabIndicator"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('integrations')}
                            className={`px-4 py-3 font-poppins text-sm transition-all relative
                                ${activeTab === 'integrations' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Store Integrations
                            {activeTab === 'integrations' && (
                                <motion.div
                                    className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600'
                                    layoutId="activeTabIndicator"
                                />
                            )}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Files tab content */}
                        {activeTab === 'files' && (
                            <motion.div
                                key="files"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                                    <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
                                        <h2 className='text-lg font-rowdies text-gray-800'>Your Data Files</h2>
                                        <div className='flex items-center gap-2'>
                                            <div className='relative'>
                                                <Search size={16} className='absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400' />
                                                <input
                                                    type="text"
                                                    placeholder="Search files..."
                                                    value={fileSearchQuery}
                                                    onChange={(e) => setFileSearchQuery(e.target.value)}
                                                    className='pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    <div className='divide-y divide-gray-100'>
                                        {isFileLoading ? (
                                            <div className='p-12 flex justify-center'>
                                                <Loader className='animate-spin text-blue-600' size={32} />
                                            </div>
                                        ) : fileerror ? (
                                            <div className='p-6 text-center'>
                                                <p className='text-red-500'>{fileerror}</p>
                                            </div>
                                        ) : filteredFiles.length === 0 ? (
                                            <div className='p-8 text-center'>
                                                <div className='bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4'>
                                                    <FileText size={24} className='text-gray-400' />
                                                </div>
                                                <h3 className='text-lg font-poppins text-gray-800'>No files found</h3>
                                                <p className='text-gray-500 mt-1'>
                                                    {fileSearchQuery ? 'Try a different search term' : 'Upload files to get started'}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className='px-6 py-3 bg-gray-50 text-gray-500 text-xs font-poppins grid grid-cols-12'>
                                                    <div className='col-span-5'>FILENAME</div>
                                                    <div className='col-span-3'>CREATED</div>
                                                    <div className='col-span-2'>TYPE</div>
                                                    <div className='col-span-2 text-right'>ACTIONS</div>
                                                </div>

                                                {filteredFiles.map((file) => (
                                                    <motion.div
                                                        key={file._id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className='px-6 py-4 hover:bg-gray-50 grid grid-cols-12 items-center group'
                                                    >
                                                        <div className='col-span-5 flex items-center gap-3'>
                                                            <div className='w-8 h-8 rounded bg-blue-100 flex items-center justify-center'>
                                                                <FileText size={14} className='text-blue-600' />
                                                            </div>
                                                            <div>
                                                                <h3 className='text-sm font-poppins text-gray-800 truncate max-w-xs cursor-pointer hover:text-blue-600'
                                                                    onClick={() => handleFileClick(file._id)}>
                                                                    {file.name}
                                                                </h3>
                                                            </div>
                                                        </div>

                                                        <div className='col-span-3 text-sm text-gray-600'>
                                                            {new Date(file.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </div>

                                                        <div className='col-span-2'>
                                                            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-poppins bg-blue-100 text-blue-800'>
                                                                {file.name.split('.').pop()?.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        <div className='col-span-2 flex justify-end gap-2'>
                                                            <button
                                                                onClick={() => handleFileClick(file._id)}
                                                                className='p-1.5 rounded-md hover:bg-gray-200 transition-colors'
                                                                title="View file"
                                                            >
                                                                <Eye size={16} className='text-gray-600' />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(file._id)}
                                                                className='p-1.5 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors'
                                                                title="Delete file"
                                                            >
                                                                <Trash2 size={16} className='text-gray-600 group-hover:text-red-600' />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Integrations tab content */}
                        {activeTab === 'integrations' && (
                            <motion.div
                                key="integrations"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Integration info card */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                                        <div className="bg-blue-50 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                            <Store size={24} />
                                        </div>
                                        <h3 className="text-lg font-rowdies text-gray-800 mb-2">Store Integration</h3>
                                        <p className="text-gray-600 text-sm mb-6">
                                            Connect your e-commerce store to automatically import sales and inventory data for advanced visualizations.
                                        </p>
                                        <button
                                            className="w-full py-2.5 bg-[#053252] text-white rounded-lg font-poppins flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-sm"
                                            onClick={handleConnectStore}
                                        >
                                            <span>Connect Store</span>
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>

                                    {/* Connected stores section */}
                                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="font-rowdies text-xl text-gray-800 mb-4">Connected Stores</h3>

                                        {isStoresLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <div className="relative w-16 h-16 mb-4">
                                                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
                                                    <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                                                        <Store size={20} className="text-blue-600" />
                                                    </div>
                                                </div>
                                                <p className="text-gray-500 font-poppins">Loading your stores...</p>
                                            </div>
                                        ) : Array.isArray(stores) && stores.length > 0 ? (
                                            <div className="space-y-4">
                                                {stores.map(store => (
                                                    <motion.div
                                                        key={store._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="border border-gray-200 rounded-lg hover:border-blue-200 transition-all hover:shadow-md overflow-hidden"
                                                    >
                                                        <div className="flex justify-between items-center p-4 md:p-5">
                                                            <div className="flex items-start md:items-center flex-col md:flex-row md:gap-4">
                                                                {/* Store icon */}
                                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3 md:mb-0">
                                                                    <Store size={20} className="text-white" />
                                                                </div>

                                                                {/* Store details */}
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-medium text-lg text-gray-800">{store.name}</h4>
                                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                                            {store.status || 'Active'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="text-sm text-gray-500 mt-1">
                                                                        Connected {new Date(store.createdAt).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </div>

                                                                    <div className="mt-2 flex items-center gap-3">
                                                                        <a
                                                                            href={store.apiEndpoint}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                        >
                                                                            <ExternalLink size={12} className="mr-1" />
                                                                            View API Endpoint
                                                                        </a>
                                                                        <button
                                                                            onClick={() => handleDisconnectStore(store._id)}
                                                                            className="text-xs text-red-600 hover:text-red-800 hover:underline flex items-center"
                                                                        >
                                                                            <Trash2 size={12} className="mr-1" />
                                                                            Disconnect
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Stats and indicators */}
                                                            <div className="hidden md:flex flex-col items-end">
                                                                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                                    <Check size={12} className="mr-1" /> Connection Active
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Store metrics panel (expandable in future) */}
                                                        {/* <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                                                            <div className="text-xs text-gray-600">
                                                                Last sync: <span className="font-medium">Just now</span>
                                                            </div>
                                                            <button
                                                                className="text-xs text-blue-600 hover:underline"
                                                                onClick={() => toast.success("Data sync initiated!")}
                                                            >
                                                                Sync Now
                                                            </button> 
                                                        </div> */}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-gradient-to-r from-amber-50 to-blue-50 border border-gray-200 rounded-lg p-6">
                                                <div className="max-w-lg mx-auto text-center">
                                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm mx-auto mb-4 flex items-center justify-center">
                                                        <Store size={28} className="text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-800 mb-2">No stores connected yet</h3>
                                                    <p className="text-gray-600 text-sm mb-5">
                                                        Connect your e-commerce store to automatically import your sales and inventory data.
                                                        This will allow you to create powerful visualizations and gain insights from your store data.
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                        <button
                                                            className="px-4 py-2 bg-[#053252] text-white rounded-md flex items-center justify-center gap-1 text-sm font-medium hover:bg-opacity-90"
                                                            onClick={handleConnectStore}
                                                        >
                                                            <Store size={16} />
                                                            Connect Your First Store
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md flex items-center justify-center gap-1 text-sm"
                                                            onClick={() => toast.success("Documentation coming soon!")}
                                                        >
                                                            Learn More
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                    </div>
                                </div>
                                
                            </motion.div>
                        )}
                        <StoreModal
                            isOpen={isStoreModalOpen}
                            onClose={() => setIsStoreModalOpen(false)}
                            onStoreConnected={handleStoreConnected}
                        />
                    </AnimatePresence>

                    {/* Additional info area */}
                    <div className='mt-8 bg-gradient-to-r from-[#053252] to-[#4a8cbb1b] rounded-xl shadow-md p-6 text-white'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h3 className='text-xl font-rowdies'>Ready to visualize your data?</h3>
                                <p className='text-blue-100 mt-2'>
                                    Create interactive charts and dashboards with your uploaded data
                                </p>
                            </div>
                            <button
                                className='px-5 py-2.5 bg-white text-blue-800 rounded-lg font-poppins hover:bg-blue-50 transition-colors'
                                onClick={() => navigate('/visualization')}
                            >
                                Create Visualization
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isModalOpen}
                onSearchReplace={handleSearchReplace}
                onClose={() => setIsModalOpen(false)}
                onSave={handleFileSave}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{files.find(f => f._id === fileId)?.name}</h2>
                        <div className="flex items-center gap-2">
                            {nullCount > 0 && (
                                <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md text-sm">
                                    <AlertTriangle size={16} className="mr-2" />
                                    <span>{nullCount} empty cells detected</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        {fileData && fileHeaders && (
                            <DataSheetGrid
                                value={rowData}
                                onChange={setRowData}
                                columns={colDefs}
                                className="w-full"
                            />
                        )}
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isSearchReplaceOpen}
                onClose={() => setIsSearchReplaceOpen(false)}
                showSaveButton={false}
                showSearchReplaceButton={false}
                size="small"
            >
                <div className="p-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearchReplaceSubmit(); }}>
                        <h2 className='text-xl font-rowdies mb-4'>Search and Replace</h2>
                        <div className='mb-4'>
                            <label className='block text-gray-700 text-sm font-poppins mb-2' htmlFor='searchValue'>
                                Search Value
                            </label>
                            <input
                                id='searchValue'
                                type='text'
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                required
                            />
                        </div>
                        <div className='mb-6'>
                            <label className='block text-gray-700 text-sm font-poppins mb-2' htmlFor='replaceValue'>
                                Replace Value
                            </label>
                            <input
                                id='replaceValue'
                                type='text'
                                value={replaceValue}
                                onChange={(e) => setReplaceValue(e.target.value)}
                                className='block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                required
                            />
                        </div>
                        <div className='flex justify-end'>
                            <button
                                type='button'
                                className='mr-3 px-4 py-2 text-sm font-poppins text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50'
                                onClick={() => setIsSearchReplaceOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className='px-4 py-2 text-sm font-poppins text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700'
                            >
                                Replace All
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ProfileModal isOpen={isProfileModalOpen} onClose={handleCloseProfileModal} />
        </div>
    );
}

export default DashboardPage;