import { Binoculars } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  children: React.ReactNode;
  showSaveButton?: boolean;
  showSearchReplaceButton?: boolean;
  onSearchReplace?: () => void;
  size?: 'small' | 'medium' | 'large'; // Add this prop
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave,children, showSaveButton = true, showSearchReplaceButton = true, onSearchReplace, size = 'large' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'w-1/4 max-w-sm',
    medium: 'w-1/2 max-w-lg',
    large: 'w-3/4 max-w-5xl',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`relative bg-white rounded-lg p-4 ${sizeClasses[size]} h-auto max-h-3/4`}>
        <button className="absolute top-2 right-2 text-gray-500 text-2xl p-2" onClick={onClose}>
          &times;
        </button>
        {showSearchReplaceButton && (
            <button className="customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl" onClick={onSearchReplace}>
              <Binoculars size={24} />
            </button> 
          )}
        <div className="pt-8">
          {children}
        </div>
        <div className="flex justify-end mt-4">
          {showSaveButton && (
            <button className="customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-1/6" onClick={onSave}>
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;