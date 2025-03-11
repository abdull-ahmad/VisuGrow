import React, { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal';
import { File, UploadCloud, Grid, ShoppingBag, Search, AlertTriangle, X, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore'
import 'react-datasheet-grid/dist/style.css'
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
    DataSheetGrid,
    textColumn,
    Column,
    keyColumn,
    dateColumn,
    intColumn,
    percentColumn,
} from 'react-datasheet-grid'
import { useDataStore } from '../../store/dataStore';
import toast from 'react-hot-toast';
import Sidebar from '../../components/SideBar';
import { useNavigate } from 'react-router-dom';
import { isValid, parse } from 'date-fns';
import { motion } from 'framer-motion';

type RowData = { [key: string]: string | number | Date | null; };

type ColumnDefinition = {
    name: string;
    type: 'text' | 'number' | 'percent' | 'date';
}

const UploadDataPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowData, setRowData] = useState<RowData[]>([]);
    const [colDefs, setColDefs] = useState<Column<RowData>[]>([]);
    const [columnDefinitions, setColumnDefinitions] = useState<ColumnDefinition[]>([]);
    const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [replaceValue, setReplaceValue] = useState('');
    const [isSearchReplaceOpen, setIsSearchReplaceOpen] = useState(false);
    const { logout, isLoading, error } = useAuthStore();
    const { saveFile, fileerror } = useDataStore();
    const [nullCount, setNullCount] = useState(0);
    const [fileIsLoading, setFileIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => { logout(); }

    const openModal = () => setIsModalOpen(true);

    // Helper function to determine column type
    const getColumnType = (column: Column): 'text' | 'number' | 'percent' | 'date' => {
        // Compare the column configuration with predefined columns
        const columnStr = JSON.stringify(column);
        if (columnStr.includes(JSON.stringify(intColumn))) return 'number';
        if (columnStr.includes(JSON.stringify(percentColumn))) return 'percent';
        if (columnStr.includes(JSON.stringify(dateColumn))) return 'date';
        return 'text';
    };

    // Rest of your helper functions remain the same
    const determineColumnType = (values: (string | number | Date | null)[]): 'text' | 'number' | 'date' | 'percent' => {
        // Existing implementation
        for (const value of values) {
            if (value === null) continue;

            // Check if the value is already a number
            if (typeof value === 'number') {
                return 'number';
            }
            // Check if the value is a string that can be converted to a number
            if (typeof value === 'string') {
                // Trim whitespace from the string
                const trimmedValue = value.trim();

                // Check if the value is a percentage
                if (trimmedValue.endsWith('%')) {
                    const numericValue = trimmedValue.slice(0, -1); // Remove the '%' sign
                    if (!isNaN(Number(numericValue))) {
                        return 'percent';
                    }
                }

                // Check if the value is a number
                if (!isNaN(Number(trimmedValue))) {
                    return 'number';
                }

                // Check if the value is a date
                const dateFormats = [
                    'yyyy-MM-dd', // ISO format
                    'MM/dd/yyyy', // US format
                    'dd/MM/yyyy', // European format
                    'yyyy/MM/dd', // Another common format
                    'yyyy-MM-dd\'T\'HH:mm:ss', // ISO datetime format
                    'yyyy-MM-dd\'T\'HH:mm:ss.SSS', // ISO datetime with milliseconds
                    'd-MMM-yy',
                    'dd-MMM-yy',
                    'd-MMM-yyyy',
                    'dd-MMM-yyyy',
                ];

                for (const format of dateFormats) {
                    const parsedDate = parse(trimmedValue, format, new Date());
                    if (isValid(parsedDate)) {
                        return 'date';
                    }
                }
            }
        }

        // Default to text if no other type is detected
        return 'text';
    };

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

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event?.target?.files?.length) return;

        setFileIsLoading(true);
        const file = event.target.files[0];
        const reader = new FileReader();
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        reader.onload = (e) => {
            if (!e?.target?.result) {
                setFileIsLoading(false);
                return;
            }

            try {
                if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                    const data = new Uint8Array(e.target.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData: (string | number | Date | null)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

                    const headers = jsonData[0] as string[];
                    const rows = jsonData.slice(1).map(row => {
                        const rowObject: { [key: string]: string | number | Date | null } = {};
                        headers.forEach((header, index) => {
                            rowObject[header] = row[index] ?? null;
                        });
                        return rowObject;
                    });

                    const { columns, rowData } = processData(headers, rows);
                    setColDefs(columns);
                    setRowData(rowData);
                    setFileName(file.name);
                    setIsModalOpen(true);
                } else if (fileExtension === 'csv') {
                    Papa.parse(file, {
                        complete: (result) => {
                            const jsonData = result.data as Array<{ [key: string]: string | number | Date | null }>;
                            const headers = result.meta.fields as string[];
                            const rows = jsonData.map(row => {
                                const rowObject: { [key: string]: string | number | Date | null } = {};
                                headers.forEach(header => {
                                    rowObject[header] = row[header] ?? null;
                                });
                                return rowObject;
                            });

                            const { columns, rowData } = processData(headers, rows);
                            setColDefs(columns);
                            setRowData(rowData);
                            setFileName(file.name);
                            setIsModalOpen(true);
                        },
                        header: true,
                        skipEmptyLines: true,
                        dynamicTyping: true,
                    });
                } else {
                    toast.error('Unsupported file format');
                }
            } catch (error) {
                toast.error('Error processing file');
                console.error(error);
            } finally {
                setFileIsLoading(false);
            }
        };

        if (fileExtension === 'csv') {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    // Data processing functions remain the same
    const processData = (
        headers: string[],
        rows: Array<{ [key: string]: string | number | Date | null }>
    ): { columns: Column[]; rowData: any } => {
        // Column Definitions
        const columns: Column[] = headers.map((header: string) => {
            const columnType = determineColumnType(rows.map(row => row[header]));
            return createColumn(header, columnType);
        });

        // Row Data Mapping
        const rowDataMapped = rows.map((row: { [key: string]: string | number | Date | null }) => {
            const mappedRowData: { [key: string]: string | number | Date | null } = {};
            headers.forEach((header: string) => {
                let cellValue = row[header];
                if (typeof cellValue === 'string') {
                    const trimmedValue = cellValue.trim();

                    // Handle percentage values
                    if (trimmedValue.endsWith('%')) {
                        const numericValue = trimmedValue.slice(0, -1);
                        if (!isNaN(Number(numericValue))) {
                            cellValue = parseFloat(numericValue) / 100;
                        }
                    }
                    // Handle numeric values
                    else if (!isNaN(Number(trimmedValue))) {
                        cellValue = Number(trimmedValue);
                    }
                    // Handle date values
                    else {
                        const dateFormats = [
                            'yyyy-MM-dd', // ISO format
                            'MM/dd/yyyy', // US format
                            'dd/MM/yyyy', // European format
                            'yyyy/MM/dd', // Another common format
                            'yyyy-MM-dd\'T\'HH:mm:ss', // ISO datetime format
                            'yyyy-MM-dd\'T\'HH:mm:ss.SSS', // ISO datetime with milliseconds
                            'd-MMM-yy',
                            'dd-MMM-yy',
                            'd-MMM-yyyy',
                            'dd-MMM-yyyy',
                        ];
                        for (const format of dateFormats) {
                            const parsedDate = parse(trimmedValue, format, new Date());
                            if (isValid(parsedDate)) {
                                cellValue = parsedDate;
                                break;
                            }
                        }
                    }
                }
                mappedRowData[header] = cellValue !== undefined && cellValue !== '' ? cellValue : null;
            });
            return mappedRowData;
        });

        return { columns, rowData: rowDataMapped };
    };

    // Event handlers remain largely the same
    const handleColumnFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const columns: Column[] = columnDefinitions.map((colDef) => createColumn(colDef.name, colDef.type));

        setColDefs(columns);
        setRowData([]);
        setIsModalOpen(true);

        setIsColumnFormOpen(false);
    };

    const closeModal = () => {
        const userConfirmed = window.confirm("You have unsaved changes. Are you sure you want to close the modal?");
        if (userConfirmed) {
            setIsModalOpen(false);
        }
    }

    const clearFile = () => {
        setFileName(null);
        setRowData([]);
        setColDefs([]);
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

    const handleFileSave = async () => {
        try {
            const columnInfo = colDefs.map(col => ({
                title: col.title,
                type: getColumnType(col)
            }));

            await saveFile({
                rows: rowData,
                columns: columnInfo,
                fileName: fileName || 'default_filename'
            });

            toast.success('File saved successfully!');

            setTimeout(() => {
                navigate(0);
            }, 2000);

        } catch (error) {
            console.error('Error saving file:', error);
        }
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

    return (
        <div className='flex h-screen bg-[#4a8cbb1b]'>
            <Sidebar isLoading={isLoading} error={error} handleLogout={handleLogout} />
            <div className='flex-1 overflow-auto'>
                <header className='bg-[#4a8cbb1b] shadow-sm px-8 py-6'>
                    <h1 className='text-3xl font-rowdies text-gray-800'>Data Management</h1>
                    <p className='text-gray-500 mt-1 font-poppins'>Upload, create, or integrate data sources</p>
                </header>

                <main className='max-w-7xl mx-auto px-4 py-8 space-y-8'>
                    {/* Upload Data Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'
                    >
                        <div className='border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-white flex items-center'>
                            <div className='bg-blue-100 p-2 rounded-lg mr-4'>
                                <UploadCloud size={24} className='text-[#053252]' />
                            </div>
                            <div>
                                <h2 className='text-lg font-rowdies text-gray-800'>Upload Data File</h2>
                            </div>
                        </div>

                        <div className='p-6'>
                            {!fileName ? (
                                <div className='flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg py-12 px-6 bg-gray-50'>
                                    <UploadCloud size={48} className='text-blue-400 mb-4' />
                                    <p className='text-gray-600 mb-6 text-center font-poppins'>
                                        Upload your file here
                                    </p>
                                    <label className='bg-[#053252] text-white rounded-lg px-6 py-2.5 
                                        cursor-pointer transition-colors font-poppins flex items-center shadow-sm'>
                                        {fileIsLoading ? (
                                            <><Loader2 size={18} className='mr-2 animate-spin' /> Uploading...</>
                                        ) : (
                                            <>Select File</>
                                        )}
                                        <input
                                            type='file'
                                            accept='.csv, .xlsx, .xls'
                                            onChange={handleUpload}
                                            className='hidden'
                                            disabled={fileIsLoading}
                                        />
                                    </label>
                                    <p className='text-xs text-gray-400 mt-4'>
                                        Supported formats: .csv, .xlsx, .xls
                                    </p>
                                </div>
                            ) : (
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center'>
                                        <div className='bg-blue-100 p-3 rounded-lg'>
                                            <File size={24} className='text-blue-700' />
                                        </div>
                                        <div className='ml-4'>
                                            <h3 className='font-poppins text-gray-800'>{fileName}</h3>
                                            <p className='text-sm text-gray-500 font-poppins'>{rowData.length} rows • {colDefs.length} columns</p>
                                        </div>
                                    </div>
                                    <div className='flex space-x-3'>
                                        <button
                                            onClick={openModal}
                                            className='bg-blue-50 hover:bg-blue-100 text-blue-700 font-poppins px-4 py-2 
                                            rounded-lg transition-colors flex items-center'
                                        >
                                            <ChevronRight size={16} className='mr-1' /> View & Edit
                                        </button>
                                        <button
                                            onClick={clearFile}
                                            className='border border-gray-200 hover:bg-gray-50 text-gray-600 font-popppins px-4 py-2 
                                            rounded-lg transition-colors flex items-center'
                                        >
                                            <X size={16} className='mr-1' /> Clear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Create Sheet Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'
                    >
                        <div className='border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-purple-50 to-white flex items-center'>
                            <div className='bg-purple-100 p-2 rounded-lg mr-4'>
                                <Grid size={24} className='text-purple-700' />
                            </div>
                            <div>
                                <h2 className='text-lg font-rowdies text-gray-800'>Create Data Sheet</h2>
                                <p className='text-sm text-gray-500'>Build a custom data sheet from scratch</p>
                            </div>
                        </div>

                        <div className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div className='max-w-lg'>
                                    <p className='text-gray-600 mb-1'>Don't have data ready to upload?</p>
                                    <p className='text-sm text-gray-500'>Create a custom data sheet with your own columns and data types.</p>
                                </div>
                                <button
                                    onClick={() => setIsColumnFormOpen(true)}
                                    className='bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800
                                        text-white shadow-sm rounded-lg px-6 py-2.5 font-poppins transition-all'
                                >
                                    Create New Sheet
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Integration Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'
                    >
                        <div className='border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-green-50 to-white flex items-center'>
                            <div className='bg-green-100 p-2 rounded-lg mr-4'>
                                <ShoppingBag size={24} className='text-green-700' />
                            </div>
                            <div>
                                <h2 className='text-lg font-rowdies text-gray-800'>E-commerce Integration</h2>
                                <p className='text-sm text-gray-500'>Connect your online store</p>
                            </div>
                        </div>

                        <div className='p-6'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                <div className='space-y-2'>
                                    <p className='text-gray-600'>Seamlessly connect your e-commerce store</p>
                                    
                                </div>
                                <button
                                    onClick={() => toast.error('Coming Soon!')}
                                    className='bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
                                        text-white shadow-sm rounded-lg px-6 py-2.5 font-poppins transition-all whitespace-nowrap'
                                >
                                    Connect Store
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSearchReplace={handleSearchReplace}
                onSave={handleFileSave}

            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{fileName}</h2>
                        <div className="flex items-center gap-2">
                            {nullCount > 0 && (
                                <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
                                    <AlertTriangle size={16} className="mr-1" />
                                    <span className="text-sm">{nullCount} empty cells</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <DataSheetGrid
                            value={rowData}
                            onChange={setRowData}
                            columns={colDefs}
                            className="w-full"
                        />
                    </div>

                    {fileerror && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {fileerror}
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={isSearchReplaceOpen}
                onClose={() => setIsSearchReplaceOpen(false)}
                showSaveButton={false}
                showSearchReplaceButton={false}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center">
                            <Search size={18} className="mr-2 text-gray-500" />
                            Search & Replace
                        </h2>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSearchReplaceSubmit(); }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-poppins text-gray-700 mb-1" htmlFor="searchValue">
                                    Find
                                </label>
                                <input
                                    id="searchValue"
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Text to find..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-poppins text-gray-700 mb-1" htmlFor="replaceValue">
                                    Replace with
                                </label>
                                <input
                                    id="replaceValue"
                                    type="text"
                                    value={replaceValue}
                                    onChange={(e) => setReplaceValue(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Replacement text..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsSearchReplaceOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                                Replace All
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            {/* Column Form Modal */}
            <Modal
                isOpen={isColumnFormOpen}
                onClose={() => setIsColumnFormOpen(false)}
                showSaveButton={false}
                showSearchReplaceButton={false}

            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center">
                            <Plus size={18} className="mr-2 text-gray-500" />
                            Create Data Sheet
                        </h2>
                    </div>

                    <form onSubmit={handleColumnFormSubmit}>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Define your data columns and their types to create a blank sheet.
                            </p>

                            {columnDefinitions.map((column, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={column.name}
                                            onChange={(e) => {
                                                const newColumnDefinitions = [...columnDefinitions];
                                                newColumnDefinitions[index].name = e.target.value;
                                                setColumnDefinitions(newColumnDefinitions);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Column name"
                                            required
                                        />
                                    </div>
                                    <select
                                        value={column.type}
                                        onChange={(e) => {
                                            const newColumnDefinitions = [...columnDefinitions];
                                            newColumnDefinitions[index].type = e.target.value as 'text' | 'number' | 'percent' | 'date';
                                            setColumnDefinitions(newColumnDefinitions);
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="percent">Percentage</option>
                                        <option value="date">Date</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newColumnDefinitions = columnDefinitions.filter((_, i) => i !== index);
                                            setColumnDefinitions(newColumnDefinitions);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => {
                                    setColumnDefinitions([...columnDefinitions, { name: '', type: 'text' }]);
                                }}
                                className="flex items-center text-blue-600 hover:text-blue-800 py-2"
                            >
                                <Plus size={16} className="mr-1" /> Add Column
                            </button>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsColumnFormOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={columnDefinitions.length === 0}
                                className="px-4 py-2 bg-[#053252] text-white rounded-lg disabled:bg-blue-300"
                            >
                                Create Sheet
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default UploadDataPage;