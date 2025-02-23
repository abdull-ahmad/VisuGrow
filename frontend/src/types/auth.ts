export interface AuthState {
    user: any;
    isAuthenticated: boolean;
    isVerified: boolean;    
    message: string | null;
    error: string | null;
    isLoading: boolean;
    isCheckingAuth: boolean;
    signup: (email: string, password: string, name: string) => Promise<void>;
    verifyEmail: (code: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    checkAuth: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;  
    resetPassword: (password: string, token: string | undefined) => Promise<void>;  
    updateProfile: (name: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    logout: () => Promise<void>;
}