import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/file';

interface DataStore{
    saveFile: (data: { rows: any; columns: any; fileName: string }) => Promise<void>;
};

export const useDataStore = create<DataStore>((set) => ({
    saveFile: async (data) => {
        try {
            await axios.post(`${API_URL}/upload`, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
    },
}));
