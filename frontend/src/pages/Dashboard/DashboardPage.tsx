import { useEffect, useState } from 'react';
import { Loader, CircleUserRound, Trash2, Store } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { DataSheetGrid, Column, keyColumn, textColumn, intColumn, percentColumn, dateColumn } from 'react-datasheet-grid';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import Sidebar from '../../components/SideBar';
import './custom.css'

type RowData = { [key: string]: string | number | Date | null; };

// Define a type for the header
interface Header {
    title: string;
    type: 'text' | 'number' | 'percent' | 'date';
}


const DashboardPage = () => {
    const { logout, isLoading, error, user } = useAuthStore();
    const { files, viewFile, deleteFile, openFile, editFile, fileName, isFileLoading, fileerror, fileData, fileHeaders } = useDataStore();

    const [rowData, setRowData] = useState<RowData[]>([]);
    const [colDefs, setColDefs] = useState<Column<RowData>[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        viewFile();
    }, [viewFile]);

    useEffect(() => {
        if (fileData && fileHeaders) {
            const columns = fileHeaders.map((header:Header) => createColumn(header.title, header.type));
            const rows = mapRowData(fileData, fileHeaders);
            setColDefs(columns);
            setRowData(rows);
        }
    }, [fileData, fileHeaders]);

    const handleFileClick = async (fileId: string) => {
        await openFile(fileId);
        setIsModalOpen(true);
    };

    const handleDelete = async (fileName: string) => {
        await deleteFile(fileName);
        viewFile();
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
                fileName: fileName || 'default_filename'
            });

            toast.success('File saved successfully!');
        } catch (error) {
            console.error('Error saving file:', error);
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

    return (
        <div className='flex flex-row min-h-screen '>
            <Sidebar isLoading={isLoading} error={error} handleLogout={handleLogout} />
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
                                    <div className='flex flex-col font-poppins' onClick={() => handleFileClick(file._id)}>
                                        <span>{file.name}</span>
                                        <span className='text-sm text-gray-500'>{new Date(file.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <Trash2 className='cursor-pointer text-red-500' onClick={() => handleDelete(file._id)} />
                                </li>
                            ))}
                        </ul>
                    )}
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleFileSave}>
                        {fileData && fileHeaders && (
                            <DataSheetGrid
                                value={rowData}
                                onChange={setRowData}
                                columns={colDefs}
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
                        <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 flex flex-row gap-2 justify-center'
                        onClick={() => toast.error('Coming Soon!')}
                        > Edit Store
                        </button>
                    </div>
                    <div className='flex flex-col justify-center items-center w-1/3 bg-white rounded-3xl shadow-lg m-5 p-3    '>
                        <h1 className='text-2xl font-poppins text-center px-5 mb-5'> Need help with Integration?</h1>
                        <div className='flex flex-row  justify-center items-center gap-5'>
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-3/4 flex flex-row gap-2 justify-center'
                            onClick={() => toast.error('Coming Soon!')}> Instructions </button>
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl  w-72 flex flex-row gap-2 justify-center' 
                            onClick={() => toast.error('Coming Soon!')}
                            > Integerate Store </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage;