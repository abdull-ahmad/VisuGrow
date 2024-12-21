import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/file';

interface DataStore {
    fileData : any;
    fileHeaders: any;
    files: any[];
    message: string | null;
    fileerror: string | null;
    isFileLoading: boolean;
    saveFile: (data: { rows: any; columns: any; fileName: string }) => Promise<void>;
    openFile: (fileName: string) => Promise<void>;
    deleteFile: (fileName: string) => Promise<void>;
    viewFile: () => Promise<void>;
};

export const useDataStore = create<DataStore>((set) => ({
    files: [],
    fileData: null,
    fileHeaders: null,
    fileerror: null,
    message: null,
    isFileLoading: false,
    saveFile: async (data) => {
        set({ isFileLoading: true, fileerror: null });
        try {
            await axios.post(`${API_URL}/upload`, data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            set({ message: "File Uploaded Successfully", isFileLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ fileerror: error.response.data.message || "Error Signing Up", isFileLoading: false });
            }
            throw error;
        }
    },
     viewFile: async () => {
        set({ isFileLoading: true, fileerror: null });
        try {
            const response = await axios.get(`${API_URL}/view`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            set({ files: response.data.files, isFileLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ fileerror: error.response.data.message || "Error Viewing Files", isFileLoading: false });
            }
            throw error;
        }
    },
    deleteFile: async (fileName: string) => {
        set({ isFileLoading: true, fileerror: null });
        try {
            await axios.delete(`${API_URL}/delete/${fileName}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            set({ message: "File Deleted Successfully", isFileLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ fileerror: error.response.data.message || "Error Deleting File", isFileLoading: false });
            }
            throw error;
        }
    },
    openFile: async (fileName: string) => {
        set({ isFileLoading: true, fileerror: null });
        try {
            const response = await axios.get(`${API_URL}/open/${fileName}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            set({ fileData: response.data.file.fileData, fileHeaders: response.data.file.headers, isFileLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ fileerror: error.response.data.message || "Error Opening File", isFileLoading: false });
            }
            throw error;
        }
    },
}));
