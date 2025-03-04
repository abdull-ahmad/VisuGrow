import './custom.css'
import React, { useEffect, useState } from 'react'
import Modal from '../../components/Modal';
import SheetIcon from '../../Icons/SheetIcon'
import StoreIcon from '../../Icons/StoreIcon'
import UploadIcon from '../../Icons/UploadIcon'
import { File } from 'lucide-react'
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
import {isValid , parse } from 'date-fns';

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

    const determineColumnType = (values: (string | number | Date | null)[]): 'text' | 'number' | 'date' | 'percent' => {
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
    
        const file = event.target.files[0];
        const reader = new FileReader();
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
        reader.onload = (e) => {
            if (!e?.target?.result) return;
    
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
            }
        };
    
        if (fileExtension === 'csv') {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    // Updated processData function to handle null values
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
        <div className='flex flex-row min-h-screen '>
            <Sidebar isLoading={isLoading} error={error} handleLogout={handleLogout} />
            <div className='flex flex-col min-h-screen w-full mainCenter'>
                <h1 className='text-5xl font-rowdies text-center py-8'> Upload Data </h1>
                <div className='flex flex-row justify-center items-center'>
                    {!fileName ? (
                        <div className='flex flex-row bg-white p-4 w-3/4 min-w-fit rounded-2xl border-2 border-black py-10'>
                            <UploadIcon />
                            <div className='flex flex-col w-3/4'>
                                <label className='text-xl font-rowdies py-2'> Upload Data </label>
                                <input
                                    className='border-2 border-dotted border-gray-300 rounded-md p-2'
                                    type='file'
                                    accept='.csv, .json, .xlsx, .xls'
                                    onChange={handleUpload}
                                    id="fileInput"
                                />
                            </div>
                            
                        </div>
                    ) : (
                        <div className='flex flex-row bg-white p-4 w-3/4 min-w-fit rounded-2xl border-2 border-black py-10'>
                            <UploadIcon />
                            <div className='flex flex-col w-3/4'>
                                <h2 className='text-xl font-rowdies'>Uploaded File</h2>
                                <div className='flex flex-row border-2 border-dotted border-gray-300 rounded-md p-2 mt-2'>
                                    <File />
                                    <label className='text-xl '>  {fileName}</label>
                                </div>
                            </div>
                            <div className='flex flex-col w-1/4 items-center'>
                                <button
                                    className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4'
                                    onClick={openModal}
                                >
                                    Reopen File
                                </button>
                                <button
                                    className='bg-red-500 font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4'
                                    onClick={clearFile}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>
        
                <Modal isOpen={isModalOpen} onClose={closeModal} onSearchReplace={handleSearchReplace} onSave={handleFileSave}>
                    <DataSheetGrid
                        value={rowData}
                        onChange={setRowData}
                        columns={colDefs}
                    />
                    <p className='text-red-500 text-sm font-poppins'>Number of null values: {nullCount}</p>
                    {fileerror && <p className='text-red-500 text-sm font-poppins'>{fileerror}</p>}
                </Modal>
                {isSearchReplaceOpen && (
                    <Modal isOpen={isSearchReplaceOpen} onClose={() => setIsSearchReplaceOpen(false)} showSaveButton={false} showSearchReplaceButton={false} size="small">
                        <form onSubmit={(e) => { e.preventDefault(); handleSearchReplaceSubmit(); }}>
                            <h2 className='text-xl font-rowdies py-2'>Search and Replace</h2>
                            <div className='mb-4'>
                                <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='searchValue'>
                                    Search Value
                                </label>
                                <input
                                    id='searchValue'
                                    type='text'
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                                    required
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='replaceValue'>
                                    Replace Value
                                </label>
                                <input
                                    id='replaceValue'
                                    type='text'
                                    value={replaceValue}
                                    onChange={(e) => setReplaceValue(e.target.value)}
                                    className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                                    required
                                />
                            </div>
                            <div className='flex justify-end'>
                                <button
                                    type='submit'
                                    className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl'
                                >
                                    Replace
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
                <div className='flex flex-row justify-center items-center pt-5'>
                    <div className='flex flex-row bg-white p-4 w-3/4 rounded-2xl border-2 border-black min-w-fit py-10'>
                        <SheetIcon />
                        <div className='flex flex-col w-3/4'>
                            <label className='text-xl font-rowdies py-2'> In-App Data Entry Sheet </label>
                            <div className='flex flex-row border-2 border-dotted border-gray-300 rounded-md p-2 justify-center gap-5'>
                                <h1 className='text-l font-rowdies text-center'> Don't have <br />any data?</h1>
                                <h1 className='text-l font-rowdies text-center'> Use Our In-App Data <br /> Entry Sheet</h1>
                            </div>
                        </div>
                        <div className='flex flex-col w-1/4 justify-center items-center'>
                            <button
                                className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4'
                                onClick={() => setIsColumnFormOpen(true)}
                            >
                                Create Sheet
                            </button>
                        </div>
                    </div>
                </div>
                {isColumnFormOpen && (
                    <Modal isOpen={isColumnFormOpen} onClose={() => setIsColumnFormOpen(false)} showSaveButton={false} showSearchReplaceButton={false} size='medium' >
                        <form onSubmit={handleColumnFormSubmit}>
                            <h2 className='text-xl font-rowdies py-2'>Enter Column Names and Types</h2>
                            {columnDefinitions.map((colDef, index) => (
                                <div key={index} className='relative mb-2 flex flex-row gap-2 items-center'>
                                    <input
                                        type='text'
                                        value={colDef.name}
                                        pattern='[A-Za-z0-9 ]*'
                                        required
                                        onChange={(e) => {
                                            const newColumnDefinitions = [...columnDefinitions];
                                            newColumnDefinitions[index].name = e.target.value;
                                            setColumnDefinitions(newColumnDefinitions);
                                        }}
                                        className='border-2 border-gray-300 rounded-md p-2 w-1/2'
                                        placeholder={`Column ${index + 1}`}
                                    />
                                    <select
                                        value={colDef.type}
                                        onChange={(e) => {
                                            const newColumnDefinitions = [...columnDefinitions];
                                            newColumnDefinitions[index].type = e.target.value as 'text' | 'number' | 'percent' | 'date';
                                            setColumnDefinitions(newColumnDefinitions);
                                        }}
                                        className='border-2 border-gray-300 rounded-md p-2 w-1/2 bg-blue-100'
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="percent">Percent</option>
                                        <option value="date">Date</option>
                                    </select>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            const newColumnDefinitions = columnDefinitions.filter((_, i) => i !== index);
                                            setColumnDefinitions(newColumnDefinitions);
                                        }}
                                        className='text-red-500 ml-2'
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <div className='flex justify-end'>
                                <button
                                    type='button'
                                    onClick={() => setColumnDefinitions([...columnDefinitions, { name: '', type: 'text' }])}
                                    className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl'
                                >
                                    Add Column
                                </button>
                                <button
                                    type='submit'
                                    className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl'
                                    disabled={columnDefinitions.length === 0}
                                >
                                    Create Sheet
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
                <div className='flex flex-row justify-center items-center pt-5'>
                    <div className='flex flex-row bg-white p-4 w-3/4 rounded-2xl border-2 border-black min-w-fit py-10'>
                        <StoreIcon />
                        <div className='pl-3 flex flex-col w-3/4'>
                            <label className='text-xl font-rowdies py-2'> E-commerce Platfrom Integration </label>
                            <div className='flex flex-row border-2 border-dotted border-gray-300 rounded-md p-2 justify-center gap-5'>
                                <h1 className='text-l font-rowdies text-center'> Have an <br />Ecommerce Store?</h1>
                                <h1 className='text-l font-rowdies text-center'> Integrate With <br />VisuGrow Now!</h1>
                            </div>
                        </div>
                        <div className='flex flex-col w-1/4 justify-center items-center'>
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4' 
                            onClick={() => toast.error('Coming Soon!')}> Integerate </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadDataPage