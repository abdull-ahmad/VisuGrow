import React, { useRef, useEffect } from 'react';
import { Binoculars, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  children: React.ReactNode;
  showSaveButton?: boolean;
  showSearchReplaceButton?: boolean;
  onSearchReplace?: () => void;
  size?: 'small' | 'medium' | 'large';
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  showSearchReplaceButton = true,
  onSearchReplace,
  size = 'large',
  title,
  children,
  onSave,
  showSaveButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    small: 'w-full max-w-sm',
    medium: 'w-full max-w-2xl',
    large: 'w-full max-w-7xl',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
      <motion.div 
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        className={`relative bg-white rounded-xl shadow-2xl ${sizeClasses[size]} h-auto max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header section with close and search buttons */}
        <div className="flex items-center justify-between bg-[#053252] px-6 py-3 text-white">
          {title && <h2 className="text-lg font-medium">{title}</h2>}
          <div className="flex items-center space-x-2 ml-auto">
            {showSearchReplaceButton && (
              <button 
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                onClick={onSearchReplace}
                aria-label="Search and Replace"
              >
                <Binoculars size={20} />
              </button>
            )}
            <button 
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors" 
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Modal content area - this was missing */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        
        {/* Footer with save button if needed */}
        {showSaveButton && onSave && (
          <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-end">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-[#053252] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Modal;