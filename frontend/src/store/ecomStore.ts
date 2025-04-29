import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/store';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true 
});

interface Store {
  _id: string;
  name: string;
  apiEndpoint: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface EcomStoreState {
  storeId: string | null;
  stores: Store[];
  isLoading: boolean;
  error: string | null;
  setStoreId: (id: string | null) => void;
  fetchStores: () => Promise<void>;
  fetchStoreData: (storeId: string) => Promise<any>;
  deleteStore: (storeId: string) => Promise<boolean>;
  addStore: (name: string, apiEndpoint: string) => Promise<void>;
}

export const useEcomStore = create<EcomStoreState>((set) => ({
  storeId: null, // Initialize storeId as null
  stores: [],
  isLoading: false,
  error: null,

  setStoreId: (id) => set({ storeId: id }),
  
  addStore: async (name: string, apiEndpoint: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/add', { name, apiEndpoint });
      set((state) => ({
        stores: [...state.stores, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to connect store', isLoading: false });
      throw error;
    }
  },

  fetchStores: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/');
      // Ensure stores is always an array
      const storeData = Array.isArray(response.data) ? response.data : [];
      set({ stores: storeData, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch stores', 
        isLoading: false,
        stores: [] // Reset to empty array on error
      });
      toast.error('Failed to fetch stores');
    }
  },

  fetchStoreData: async (storeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/data/${storeId}`);
      set({ isLoading: false });
      
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch store data', isLoading: false });
      toast.error('Failed to fetch store data');
      throw error;
    }
  },

  deleteStore: async (storeId) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/delete/${storeId}`);
      set((state) => ({
        stores: state.stores.filter(store => store._id !== storeId),
        isLoading: false
      }));
      toast.success('Store disconnected successfully');
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to disconnect store', isLoading: false });
      toast.error('Failed to disconnect store');
      return false;
    }
  }
}));