import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { parse } from 'csv-parse/sync';

type DataType = 'string' | 'number' | 'boolean' | 'null' | 'date';

interface ParsedRecord {
    [key: string]: {
        value: string | number | boolean | null | Date;
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
    // Regular expression to match common date formats (e.g., YYYY-MM-DD, MM/DD/YYYY, 2 Oct, 2024, Oct 2, 2024, ISO 8601)
    const dateRegex = /^(?:\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)$/;

    if (dateRegex.test(value) && !isNaN(Date.parse(value))) {
        return 'date';
    }
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

function convertValue(value: string, type: DataType): string | number | boolean | null | Date {
    switch (type) {
        case 'number':
            return Number(value);
        case 'boolean':
            return value.toLowerCase() === 'true';
        case 'null':
            return null;
        case 'date':
            return new Date(value);
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