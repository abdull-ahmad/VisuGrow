import { create } from 'zustand';
import axios from 'axios';
import { AuthState } from '../types/auth';
import { useDataStore } from './dataStore';
import { useVisualizationStore } from './visualizationStore';

const API_URL = 'http://localhost:5000/api/auth';

axios.defaults.withCredentials = true;

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isVerified: false,
    error: null,
    message: null,
    isLoading: false,
    isCheckingAuth: true,

    signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/register`, { email, password, name });
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ error: error.response.data.message || "Error Signing Up", isLoading: false });
            }
            throw error;
        }
    },
    verifyEmail: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/verify-email`, { code });
            set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ error: error.response.data.message || "Error Verifying Email", isLoading: false });
            }
            throw error;
        }
    },
    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            set({ user: res.data.user,isAuthenticated: true, isVerified:res.data.user ,isLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ error: error.response.data.message || "Error logging in", isLoading: false });
            }
            throw error;
        }
    },
    logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
            set({ user: null, isAuthenticated: false , error: null, isLoading: false });
			useDataStore.getState().resetStore();
            useVisualizationStore.getState().resetStore();
            
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
	},
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axios.get(`${API_URL}/checkAuth`);
            set({ user: res.data.user, isAuthenticated: true, isVerified:res.data.user ,isCheckingAuth: false });
        } catch (error) {
            set({ error: null, isCheckingAuth: false });
            throw error;
        }
    },
    forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const res = await axios.post(`${API_URL}/forgot-password`, { email });
            set({ message: res.data.message, isLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ error: error.response.data.message || "Error", isLoading: false });
            }
            throw error;
        }
    },
    resetPassword: async (password: string, token: string | undefined ) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const res = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            set({ message: res.data.message, isLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ error: error.response.data.message || "Error Resetting Password", isLoading: false });
            }
            throw error;
        }
    },
    updateProfile: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/update-profile`, { name });
            set({ user: res.data.user, isLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ error: error.response.data.message || "Error updating profile", isLoading: false });
            }
            throw error;
        }
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axios.put(`${API_URL}/change-password`, { currentPassword, newPassword });
            set({ message: res.data.message, isLoading: false });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                set({ error: error.response.data.message || "Error changing password", isLoading: false });
            }
            throw error;
        }
    }
}));
