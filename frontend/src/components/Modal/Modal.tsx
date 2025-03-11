import React, { useRef, useEffect, useState } from 'react';
import { Binoculars, X, Save, Database, Search } from 'lucide-react';
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
  enableRAGTab?: boolean;
  fileName?: string | null;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  children, 
  showSaveButton = true,
  showSearchReplaceButton = true,
  onSearchReplace,
  size = 'large',
  title,
  enableRAGTab = false,
  fileName = null
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('data');
  
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
        
        {/* Tabs - Only show if RAG is enabled */}
        {enableRAGTab && (
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-3 font-medium text-sm flex items-center ${
                activeTab === 'data' 
                  ? 'text-[#053252] border-b-2 border-[#053252]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('data')}
            >
              <Database size={16} className="mr-2" />
              View & Edit Data
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm flex items-center ${
                activeTab === 'query' 
                  ? 'text-[#053252] border-b-2 border-[#053252]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('query')}
            >
              <Search size={16} className="mr-2" />
              Query Data
            </button>
          </div>
        )}
        
        {/* Content area */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'data' || !enableRAGTab ? (
            children
          ) : (
            <React.Suspense fallback={<div className="p-6">Loading query interface...</div>}>
              <RAGQueryPanel fileName={fileName} />
            </React.Suspense>
          )}
        </div>
        
        {/* Footer with save button - Only show in data tab */}
        {showSaveButton && (activeTab === 'data' || !enableRAGTab) && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end">
            <button 
              className="bg-[#053252] font-medium text-white text-sm px-6 py-2.5 rounded-lg flex items-center hover:bg-opacity-90 transition-colors shadow-sm"
              onClick={onSave}
            >
              <Save size={18} className="mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Modal;