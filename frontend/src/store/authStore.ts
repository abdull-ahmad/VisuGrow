import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

axios.defaults.withCredentials = true;

interface AuthState {
    user: any;
    isAuthenticated: boolean;
    error: string | null;
    isLoading: boolean;
    isCheckingAuth: boolean;
    signup: (email: string, password: string, name: string) => Promise<void>;
    verifyEmail: (code: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;  
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,

    signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/register`, { email, password, name });
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (error:any) {
            set({ error: error.res.data.message || "Error signing up", isLoading: false });
            throw error;
        }
    },
    verifyEmail: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/verify-email`, { code });
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (error:any) {
            set({ error: error.res.data.message || "Error verifying email", isLoading: false });
            throw error;
        }
    },
    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try{
            const res = await axios.post(`${API_URL}/login`, { email, password });
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        }catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ error: error.response.data.message || "Error logging in", isLoading: false });
              } else {
                set({ error: "Error logging in", isLoading: false });
              }
            throw error;
        }
    },
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axios.get(`${API_URL}/checkAuth`);
            set({ user: res.data.user, isAuthenticated: true, isCheckingAuth: false });
        } catch (error) {
            set({ error:null , isCheckingAuth: false });
            throw error;
        }
    },
}));
