import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/file';

interface DataStore {
    fileName: string;
    fileData : any;
    fileHeaders: any;
    files: any[];
    message: string | null;
    fileerror: string | null;
    isFileLoading: boolean;
    saveFile: (data: { rows: any; columns: any; fileName: string }) => Promise<void>;
    editFile: (data: { rows: any; columns: any; fileName: string }) => Promise<void>;
    openFile: (fileName: string) => Promise<void>;
    deleteFile: (fileName: string) => Promise<void>;
    viewFile: () => Promise<void>;
};

export const useDataStore = create<DataStore>((set) => ({
    files: [],
    fileName: '',
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
    deleteFile: async (fileId: string) => {
        set({ isFileLoading: true, fileerror: null });
        try {
            await axios.delete(`${API_URL}/delete/${fileId}`, {
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
    openFile: async (fileId: string) => {
        set({ isFileLoading: true, fileerror: null });
        try {
            const response = await axios.get(`${API_URL}/open/${fileId}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log(response.data);
            set({ fileData: response.data.file.fileData, fileHeaders: response.data.file.headers, fileName:response.data.file.name ,isFileLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ fileerror: error.response.data.message || "Error Opening File", isFileLoading: false });
            }
            throw error;
        }
    },
    editFile: async (data) => {
        set({ isFileLoading: true, fileerror: null });
        console.log(data.fileName);
        try {
            await axios.put(`${API_URL}/edit/${data.fileName}`, data , {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            set({ message: "File Edited Successfully", isFileLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ fileerror: error.response.data.message || "Error Editing File", isFileLoading: false });
            }
            throw error;
        }
    },
}));
