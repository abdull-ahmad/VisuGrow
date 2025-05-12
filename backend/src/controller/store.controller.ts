import { Request, Response } from 'express';
import axios from 'axios';
import { Store } from '../models/store.model';
import { isValid, parse } from 'date-fns'

interface CustomRequest extends Request {
    userId?: string;
}

const inferDataType = (value: any): string => {
    if (value === null || value === undefined) return 'string'; // Treat null/undefined as string columns for simplicity

    const type = typeof value;

    // 1. Check Booleans (including string representations)
    if (type === 'boolean') return 'boolean';
    if (type === 'string') {
        const lowerCaseValue = value.trim().toLowerCase();
        if (['true', 'false', 'yes', 'no', 'y', 'n', '1', '0'].includes(lowerCaseValue)) {
            return 'boolean';
        }
    }

    // 2. Check Numbers (including string representations)
    if (type === 'number' && Number.isFinite(value)) return 'number';
    if (type === 'string' && value.trim() !== '') {
        // Check for currency symbols
        const strValue = value.trim();
        const currencySymbols = ['$', '€', '£', '¥', '₹'];
        
        if (currencySymbols.some(symbol => strValue.startsWith(symbol))) {
            const numericValue = strValue.substring(1).replace(/,/g, '').trim();
            if (!isNaN(Number(numericValue))) {
                return 'number';
            }
        }
        
        // Check for percentage values
        if (strValue.endsWith('%')) {
            const numericValue = strValue.slice(0, -1).trim();
            if (!isNaN(Number(numericValue))) {
                return 'number';
            }
        }
        
        // Check for plain numbers
        if (/^-?\d+(\.\d+)?$/.test(strValue.replace(/,/g, ''))) {
            return 'number';
        }
    }

    // 3. Check Dates with date-fns - Much more robust
    if (type === 'string' && value.trim() !== '') {
        const strValue = value.trim();
        
        // Define common date formats to test
        const DATE_FORMATS = [
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
        
        // Try parsing with each format
        for (const format of DATE_FORMATS) {
            const parsedDate = parse(strValue, format, new Date());
            if (isValid(parsedDate)) {
                return 'date';
            }
        }
        
        // Fallback to standard Date parsing with validation
        // But only if string contains typical date separators
        if (strValue.includes('-') || strValue.includes('/') || 
            strValue.includes('T') || strValue.includes(':')) {
            const potentialDate = new Date(strValue);
            if (!isNaN(potentialDate.getTime())) {
                return 'date';
            }
        }
    }

    // 4. Default to String
    return 'string';
};

interface SourceHeader {
    name: string;
    type: string;
  }

export const getStores = async (req: CustomRequest, res: Response) => {
    try {
        const stores = await Store.find({ user: req.userId }).sort({ createdAt: -1 });
        return res.status(200).json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        return res.status(500).json({ message: 'Failed to fetch stores' });
    }
};

export const validateEndpoint = async (req: Request, res: Response) => {
    const { endpoint } = req.body;

    if (!endpoint) {
        return res.status(400).json({ message: 'API endpoint is required' });
    }

    try {
        const response = await axios.get(endpoint, { timeout: 15000 });
        return res.status(200).json({ valid: response.status === 200 });
    } catch (error) {
        console.error('Error validating endpoint:', error);
        return res.status(200).json({ valid: false });
    }
};

export const getStoreData = async (req: CustomRequest, res: Response) => {
    const { storeId } = req.params;

    try {
        const store = await Store.findOne({ _id: storeId, user: req.userId });

        if (!store) {
            return res.status(404).json({ message: 'Store not found or not authorized' });
        }

        // Fetch data from the external API endpoint
        const response = await axios.get(store.apiEndpoint, { timeout: 15000 });

        // --- Data Transformation ---
        let rawData = response.data; // Use let as we might modify/slice it

        // Ensure the data is an array
        if (!Array.isArray(rawData)) {
             return res.status(400).json({ message: 'API endpoint did not return an array of data.' });
        }

        if (rawData.length === 0) {
            return res.status(200).json({ headers: [], data: [] });
        }

        // --- Check if the first row contains header names ---
        const firstItem = rawData[0];
        let dataForInference = firstItem; // Default to using the first item
        let actualData = rawData; // Default to using the full array

        // Check if all values in the first item are strings
        const firstItemIsHeaders = Object.values(firstItem).every(val => typeof val === 'string');

        if (firstItemIsHeaders && rawData.length > 1) {
            dataForInference = rawData[1]; // Use the second row for inference
            actualData = rawData.slice(1); // Remove the header row from the actual data payload
        } else if (firstItemIsHeaders && rawData.length <= 1) {
            console.warn("First row looks like headers, but no second row found for inference. Defaulting types.");
            // Option 1: Default all to string based on header names
             const headers: SourceHeader[] = Object.keys(firstItem).map(key => ({
                 name: key,
                 type: 'string' // Default to string as we only have header names
             }));
             return res.status(200).json({ headers: headers, data: [] }); // Return empty data as the only row was headers

            // Option 2: Could try inferring from header names if they follow a pattern, but less reliable.
        }
        // If firstItemIsHeaders is false, we proceed using the first item as dataForInference

        // --- Infer headers using the selected data object ---
        const headers: SourceHeader[] = Object.keys(dataForInference).map(key => ({
            name: key,
            // Ensure the key exists in the object used for inference before accessing its value
            type: dataForInference.hasOwnProperty(key) ? inferDataType(dataForInference[key]) : 'string'
        }));

        // Return the headers and the *actual* data (potentially without the first row)
        return res.status(200).json({ headers: headers, data: actualData });

    } catch (error: any) {
        console.error(`Error fetching or processing store data for storeId ${storeId}:`, error);
        let statusCode = 500;
        let message = 'Failed to fetch or process store data';
        if (axios.isAxiosError(error)) {
             if (error.response) {
                 statusCode = error.response.status >= 500 ? 502 : 400;
                 message = `Error from external API: ${error.response.status} ${error.response.statusText || ''}`.trim();
             } else if (error.request) {
                 statusCode = 504;
                 message = 'External API endpoint timed out or did not respond.';
             } else {
                 message = `Failed to configure request to external API: ${error.message}`;
             }
         } else if (error instanceof Error) {
              message = error.message;
         }
        return res.status(statusCode).json({ message });
    }
}

export const addStore = async (req: CustomRequest, res: Response) => {
    const { name, apiEndpoint } = req.body;

    if (!name || !apiEndpoint) {
        return res.status(400).json({ message: 'Store name and API endpoint are required' });
    }

    try {
        // Validate endpoint
        try {
            const response = await axios.get(apiEndpoint, { timeout: 15000 });
            if (response.status !== 200) {
                return res.status(400).json({ message: 'Invalid API endpoint' });
            }
        } catch (error) {
            return res.status(400).json({ message: 'Invalid API endpoint' });
        }

        // Check if store already exists
        const existingStore = await Store.findOne({
            user: req.userId,
            $or: [{ name }, { apiEndpoint }]
        });

        if (existingStore) {
            return res.status(400).json({ message: 'A store with this name or API endpoint already exists' });
        }

        // Create store
        const newStore = new Store({
            name,
            apiEndpoint,
            user: req.userId,
            status: 'active'
        });

        await newStore.save();
        return res.status(201).json(newStore);
    } catch (error) {
        console.error('Error adding store:', error);
        return res.status(500).json({ message: 'Failed to add store' });
    }
};

export const deleteStore = async (req: CustomRequest, res: Response) => {
    const  storeId  = req.params.storeId;

    try {
        const store = await Store.findOneAndDelete({ _id: storeId, user: req.userId });

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        return res.status(200).json({ message: 'Store disconnected successfully' });
    } catch (error) {
        console.error('Error deleting store:', error);
        return res.status(500).json({ message: 'Failed to delete store' });
    }
};