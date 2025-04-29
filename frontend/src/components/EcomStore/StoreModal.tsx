import { useState } from 'react';
import { X, Loader, Check, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useEcomStore } from '../../store/ecomStore';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-rowdies text-gray-800">Connect Store</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-poppins text-gray-700">Store Name</label>
                        <input
                            type="text"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="My E-commerce Store"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-poppins text-gray-700">API Endpoint</label>
                        <div className="flex">
                            <input
                                type="url"
                                value={apiEndpoint}
                                onChange={(e) => {
                                    setApiEndpoint(e.target.value);
                                    setIsValid(null);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://mystore.com/api"
                                required
                            />
                            <button
                                type="button"
                                onClick={handleValidate}
                                disabled={isValidating || !apiEndpoint}
                                className={`px-4 py-2 rounded-r-md ${isValidating ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                            >
                                {isValidating ? (
                                    <Loader size={16} className="animate-spin" />
                                ) : (
                                    'Validate'
                                )}
                            </button>
                        </div>

                        {isValid !== null && (
                            <div className={`mt-2 p-2 rounded flex items-center ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {isValid ? (
                                    <>
                                        <Check size={16} className="mr-1" />
                                        API endpoint is valid
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={16} className="mr-1" />
                                        Invalid API endpoint. Please check your URL and try again.
                                    </>
                                )}
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mt-1">
                            Enter your store's API endpoint that provides sales and inventory data.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-poppins text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !isValid || !storeName || !apiEndpoint}
                            className={`px-4 py-2 rounded-md text-sm font-poppins text-white 
                ${isSubmitting || !isValid || !storeName || !apiEndpoint
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#053252] hover:bg-opacity-90'
                                }`}
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
            </div>
        </div>
    );
};

export default StoreModal;