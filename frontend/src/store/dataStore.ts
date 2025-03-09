import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { DataStore } from '../types/file';

const API_URL = 'http://localhost:5000/api/file';

const initialState = {
    files: [],
    fileName: '',
    fileData: null,
    fileHeaders: null,
    fileerror: null,
    message: null,
    isFileLoading: false,
    selectedFileId: '',
};

export const useDataStore = create<DataStore>()(
    persist(
        (set) => ({
            ...initialState,

            // Reset function
            resetStore: () => {
                set(initialState);
            },

            setSelectedFileId: (fileId: string) => {
                set({ selectedFileId: fileId });
            },

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
                    // If the deleted file was selected, clear the selection
                    set((state) => ({
                        message: "File Deleted Successfully",
                        isFileLoading: false,
                        selectedFileId: state.selectedFileId === fileId ? '' : state.selectedFileId
                    }));
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
                    set({
                        fileHeaders: response.data.fields,
                        fileData: response.data.fileData,
                        isFileLoading: false,
                        selectedFileId: fileId // Store the selected file ID
                    });
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
                    set({
                        fileData: response.data.file.fileData,
                        fileHeaders: response.data.file.headers,
                        fileName: response.data.file.name,
                        isFileLoading: false,
                        selectedFileId: fileId // Store the selected file ID
                    });
                } catch (error) {
                    if (axios.isAxiosError(error) && error.response) {
                        set({ fileerror: error.response.data.message || "Error Opening File", isFileLoading: false });
                    }
                    throw error;
                }
            },

            editFile: async (data) => {
                set({ isFileLoading: true, fileerror: null });
                try {
                    await axios.put(`${API_URL}/edit/${data.fileId}`, data, {
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
        }),
        {
            name: 'data-storage', // Name for localStorage key
            partialize: (state) => ({
                selectedFileId: state.selectedFileId,
                fileName: state.fileName,
                // We don't persist fileData or fileHeaders as they could be large
            }),
        }
    )
);