import { Request, Response } from 'express';
import axios from 'axios';
import { Store } from '../models/store.model';

interface CustomRequest extends Request {
    userId?: string;
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
            return res.status(404).json({ message: 'Store not found' });
        }
        const response = await axios.get(store.apiEndpoint, { timeout: 15000 });
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching store data:', error);
        return res.status(500).json({ message: 'Failed to fetch store data' });
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