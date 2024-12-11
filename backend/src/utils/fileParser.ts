import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';

type DataType = 'string' | 'number' | 'boolean' | 'null' | 'date';
const dateRegex = /^(?:\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)$/;

interface ParsedRecord {
    [key: string]: {
        value: string | number | boolean | null | Date ;
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



function inferDataType(value: any): DataType {
    console.log('value', value);
  
    if (typeof value === 'string') {
        
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
    } else if (typeof value === 'number') {
      return 'number';
    } else if (typeof value === 'boolean') {
      return 'boolean';
    } else if (value === null) {
      return 'null';
    } else {
      return 'string';
    }
  }
  
  function convertValue(value: any, type: DataType): string | number | boolean | null | Date {
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

  function parseXLS(content: Buffer): { headers: string[], data: any[] } {
    const workbook = XLSX.read(content, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const records: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false , dateNF: 'yyyy-mm-dd' });
  
    if (records.length === 0) {
      throw new Error('No records found in the XLS file');
    }
  
    const headers = records[0].map((header: any) => header?.toString() || '');
    const data = records.slice(1).map((record: any[]) => {
      return record.map((value) => {
        if (value instanceof Date) {
          return value.toISOString().split('T')[0]; // Convert Date to YYYY-MM-DD format
        }
        const type = inferDataType(value);
        return convertValue(value, type);
      });
    });
  
    return { headers, data };
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
        return parseXLS(fileContent);
    } else {
        throw new Error('Unsupported file type');
    }
}

export { parseFile };