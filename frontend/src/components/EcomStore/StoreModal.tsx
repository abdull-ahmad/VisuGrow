import { useState } from 'react';
import { X, Loader, Check, AlertTriangle, Store, Link2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useEcomStore } from '../../store/ecomStore';
import { motion, AnimatePresence } from 'framer-motion';

interface StoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStoreConnected: () => void;
}

const StoreModal = ({ isOpen, onClose, onStoreConnected }: StoreModalProps) => {
    const [storeName, setStoreName] = useState('');
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addStore } = useEcomStore();

    const handleValidate = async () => {
        if (!apiEndpoint) return;

        setIsValidating(true);
        setIsValid(null);

        try {
            // Create a new axios instance without withCredentials for external API validation
            const response = await axios.get(apiEndpoint, { 
                timeout: 5000,
                withCredentials: false // Explicitly set to false for external endpoints
            });
            
            setIsValid(response.status === 200);
            
            if (response.status === 200) {
                toast.success('API endpoint is valid');
            } else {
                toast.error('Invalid API endpoint');
            }
        } catch (error) {
            setIsValid(false);
            toast.error('Failed to connect to API endpoint');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid || !storeName || !apiEndpoint) return;

        setIsSubmitting(true);

        try {
            await addStore(storeName, apiEndpoint);
            toast.success('Store connected successfully');
            onStoreConnected();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to connect store');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div 
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-[#053252] p-6 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                                        <Store size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Connect Store</h2>
                                        <p className="text-blue-100 text-sm">Integrate your e-commerce data</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Store size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        placeholder="My E-commerce Store"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
                                <div className="flex">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <Link2 size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="url"
                                            value={apiEndpoint}
                                            onChange={(e) => {
                                                setApiEndpoint(e.target.value);
                                                setIsValid(null);
                                            }}
                                            className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                            placeholder="https://mystore.com/api"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleValidate}
                                        disabled={isValidating || !apiEndpoint}
                                        className={`px-5 py-3 rounded-r-lg font-medium transition-colors
                                        ${isValidating || !apiEndpoint
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                    >
                                        {isValidating ? (
                                            <Loader size={18} className="animate-spin" />
                                        ) : (
                                            'Validate'
                                        )}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-2 ml-1">
                                    Enter your store's API endpoint that provides sales and inventory data.
                                </p>
                            </div>

                            {isValid !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-lg flex items-center ${isValid ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}
                                >
                                    {isValid ? (
                                        <>
                                            <div className="bg-green-100 p-1 rounded-full mr-3">
                                                <Check size={16} className="text-green-600" />
                                            </div>
                                            <span className="font-medium">API endpoint is valid and accessible</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-red-100 p-1 rounded-full mr-3">
                                                <AlertTriangle size={16} className="text-red-600" />
                                            </div>
                                            <span className="font-medium">Invalid API endpoint. Please check your URL and try again.</span>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            <div className="pt-5 flex justify-end gap-3 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isValid || !storeName || !apiEndpoint}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
                                    ${isSubmitting || !isValid || !storeName || !apiEndpoint
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-[#053252] hover:bg-[#0a4570]'}`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center">
                                            <Loader size={16} className="animate-spin mr-2" />
                                            Connecting...
                                        </div>
                                    ) : (
                                        'Connect Store'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StoreModal;