import './custom.css'
import React, { useState } from 'react'
import Modal from '../../components/Modal';
import SheetIcon from '../../Icons/SheetIcon'
import StoreIcon from '../../Icons/StoreIcon'
import UploadIcon from '../../Icons/UploadIcon'
import { Loader, LogOut } from 'lucide-react'
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
    const { logout, isLoading, error } = useAuthStore();

    const handleLogout = async () => { logout(); }

    const openModal = () => setIsModalOpen(true);

    const determineColumnType = (values: (string | number | Date)[]): 'text' | 'number' | 'date' | 'percent' => {
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/; // Matches MM/DD/YYYY format
        const numberRegex = /^-?\d+(\.\d+)?$/; // Matches integers and floating-point numbers
        const percentRegex = /^-?\d+(\.\d+)?%$/; // Matches percentage values

        for (const value of values) {
            if (typeof value === 'number' || numberRegex.test(value.toString())) {
                return 'number';
            } else if (percentRegex.test(value.toString())) {
                return 'percent';
            } else if (value instanceof Date || dateRegex.test(value.toString())) {
                return 'date';
            }
        }
        return 'text';
    };

    const createColumn = (name: string, type: 'text' | 'number' | 'percent' | 'date'): Column<RowData> => {
        switch (type) {
            case 'number':
                return { ...keyColumn<RowData, number>(name, intColumn), title: name };
            case 'percent':
                return { ...keyColumn<RowData, number>(name, percentColumn), title: name };
            case 'date':
                return { ...keyColumn<RowData, Date>(name, dateColumn), title: name };
            default:
                return { ...keyColumn<RowData, string>(name, textColumn), title: name };
        }
    };

    const processData = (
        headers: string[],
        rows: Array<{ [key: string]: string | number | Date }>
    ): { columns: Column<RowData>[]; rowData: RowData[] } => {
        // Column Definitions
        const columns: Column<RowData>[] = headers.map((header: string) => {
            console.log('Column values for header:', header, rows.map(row => row[header]));
            const columnType = determineColumnType(rows.map(row => row[header]));
            return createColumn(header, columnType);
        });

        // Row Data Mapping
        const rowDataMapped = rows.map((row: { [key: string]: string | number | Date }) => {
            const mappedRowData: { [key: string]: string | number | Date | null } = {};
            headers.forEach((header: string) => {
                let cellValue = row[header];
                if (typeof cellValue === 'string' && cellValue.endsWith('%')) {
                    // Convert "10%" to 0.1
                    cellValue = parseFloat(cellValue.slice(0, -1)) / 100;
                } else if (
                    typeof cellValue === 'string' &&
                    !isNaN(Date.parse(cellValue)) &&
                    isNaN(Number(cellValue))
                ) {
                    // Parse valid date strings and set time to noon to prevent timezone shifts
                    cellValue = new Date(cellValue);
                    cellValue.setHours(12); // Set to noon
                } else if (typeof cellValue === 'string' && !isNaN(Number(cellValue))) {
                    // Convert numeric strings to numbers
                    cellValue = Number(cellValue);
                }
                mappedRowData[header] = cellValue !== undefined && cellValue !== '' ? cellValue : null;
            });
            return mappedRowData;
        });

        return { columns, rowData: rowDataMapped };
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event || !event.target || !event.target.files || event.target.files.length === 0) {
            return;
        }
        const file = event.target.files[0];
        const reader = new FileReader();

        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split('.').pop();

        reader.onload = (e) => {
            if (!e || !e.target || !e.target.result) {
                return;
            }
            console.log(fileName);
            console.log(fileExtension);
            if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                // Handle XLSX file
                const data = new Uint8Array(e.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData: (string | number | Date)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

                const headers = jsonData[0] as string[];
                const rowsArray = jsonData.slice(1);

                // Convert rows from array to object
                const rows = rowsArray.map(row => {
                    const rowObject: { [key: string]: string | number | Date } = {};
                    headers.forEach((header, index) => {
                        rowObject[header] = row[index];
                    });
                    return rowObject;
                });

                console.log('Headers:', headers);
                console.log('Rows:', rows);

                const { columns, rowData } = processData(headers, rows);

                // Setting State
                setColDefs(columns);
                setRowData(rowData);
                setIsModalOpen(true); // Open the modal after setting the data
            } else if (fileExtension === 'csv') {
                console.log('CSV file handler');
                // Handle CSV file
                Papa.parse(file, {
                    complete: (result) => {
                        const jsonData = result.data as Array<{ [key: string]: string | number | Date }>;

                        if (jsonData.length === 0) {
                            alert('The CSV file is empty.');
                            return;
                        }
                        // Use result.meta.fields to get headers
                        const headers = result.meta.fields as string[];
                        const rows = jsonData;
                        console.log('Headers:', headers);
                        console.log('Rows:', rows);

                        const { columns, rowData } = processData(headers, rows);

                        // Setting State
                        setColDefs(columns);
                        setRowData(rowData);
                        setIsModalOpen(true); // Open the modal after setting the data
                    },
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true, // Automatically infer types
                });
            } else {
                alert('Unsupported file type');
            }
        };

        if (fileExtension === 'csv') {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    const handleColumnFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const columns: Column<RowData>[] = columnDefinitions.map((colDef) => createColumn(colDef.name, colDef.type));

        setColDefs(columns);
        setRowData([]);
        setIsModalOpen(true);
        setIsColumnFormOpen(false);
    };

    const closeModal = () => setIsModalOpen(false);

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
                    <form onSubmit={openModal} className='flex flex-row bg-white p-4 w-3/4 min-w-fit rounded-2xl border-2  border-black py-10'>
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
                        <div className='flex flex-col w-1/4 justify-center items-center'>
                            <button
                                type='button'
                                className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4'
                            >
                                {isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : 'Clear'}
                            </button>
                        </div>

                        <Modal isOpen={isModalOpen} onClose={closeModal}>
                            <DataSheetGrid
                                value={rowData}
                                onChange={setRowData}
                                columns={colDefs}
                            />
                        </Modal>
                    </form>
                </div>
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
                    <Modal isOpen={isColumnFormOpen} onClose={() => setIsColumnFormOpen(false)}>
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
                            <button className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-3/4'> Integerate </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadDataPage