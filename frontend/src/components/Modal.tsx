import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-lg p-4 w-1/2 max-w-5xl h-auto max-h-3/4">
        <button className="absolute top-2 right-2 text-gray-500 text-2xl p-2" onClick={onClose}>
          &times;
        </button>
        <div className="pt-8">
          {children}
        </div>
        <div className="flex justify-end mt-4">
          <button
            className="customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;