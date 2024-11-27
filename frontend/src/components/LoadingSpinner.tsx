import { Loader } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Loader className="animate-spin text-white" size={48} />
    </div>
  );
}

export default LoadingSpinner;