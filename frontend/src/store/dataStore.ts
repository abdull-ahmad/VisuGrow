import { create } from 'zustand';
import axios from 'axios';
import { DataStore } from '../types/file';

const API_URL = 'http://localhost:5000/api/file';


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
            console.log(response.data.files);
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
    fileFields: async (fileId: string) => {
        set({ isFileLoading: true, fileerror: null });
        try {
            const response = await axios.get(`${API_URL}/fields/${fileId}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            set({ fileHeaders: response.data.fields, isFileLoading: false });
            set({ fileData: response.data.fileData, isFileLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ fileerror: error.response.data.message || "Error Fetching File Fields", isFileLoading: false });
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
        console.log(data.fileId);
        try {
            await axios.put(`${API_URL}/edit/${data.fileId}`, data , {
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
