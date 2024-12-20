import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/file';

interface DataStore {
    message: string | null;
    fileerror: string | null;
    isLoading: boolean;
    saveFile: (data: { rows: any; columns: any; fileName: string }) => Promise<void>;
};

export const useDataStore = create<DataStore>((set) => ({
    fileerror: null,
    message: null,
    isLoading: false,
    saveFile: async (data) => {
        set({ isLoading: true, fileerror: null });
        try {
            await axios.post(`${API_URL}/upload`, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ fileerror: error.response.data.message || "Error Signing Up", isLoading: false });
            }
            throw error;
        }
    },
}));
