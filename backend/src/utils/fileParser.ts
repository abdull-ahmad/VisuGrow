import * as fs from 'fs';
import * as path  from 'path';
import * as xlsx from 'xlsx';
import { parse } from 'csv-parse/sync';

type DataType = 'string' | 'number' | 'boolean' | 'null';

interface ParsedRecord {
    [key: string]: {
        value: string | number | boolean | null;
        type: DataType;
    };
}


function readFile(filePath: string): Buffer {
    try {
        const absolutePath = path.resolve(filePath);
        const data = fs.readFileSync(absolutePath);
        return data;
    } catch (error) {
        console.error(`Error reading file from path ${filePath}:`, error);
        throw error;
    }
}

function inferDataType(value: string): DataType {
    if (!isNaN(Number(value)) && value.trim() !== '') {
        return 'number';
    } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        return 'boolean';
    } else if (value.toLowerCase() === 'null' || value.trim() === '') {
        return 'null';
    } else {
        return 'string';
    }
}

function convertValue(value: string, type: DataType): string | number | boolean | null {
    switch (type) {
        case 'number':
            return Number(value);
        case 'boolean':
            return value.toLowerCase() === 'true';
        case 'null':
            return null;
        default:
            return value;
    }
}

function parseCSV(content: string): { headers: string[], data: any[] } {
    const records: Record<string, string>[] = parse(content, { columns: true });
    if (records.length === 0) {
        throw new Error('No records found in the CSV file');
    }
    const headers = Object.keys(records[0]);
    const data = records.map((record: Record<string, string>) => {
        return headers.map(header => {
            const type = inferDataType(record[header]);
            return convertValue(record[header], type);
        });
    });
    return { headers, data };
}

function parseFile(filePath: string): { headers: string[], data: any[] } {
    const fileContent = readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.csv') {
        return parseCSV(fileContent.toString());
    } else if (ext === '.xls' || ext === '.xlsx') {
        return parseCSV(fileContent.toString());
    } else {
        throw new Error('Unsupported file type');
    }
}

export { parseFile };