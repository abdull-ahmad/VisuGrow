import React from 'react';

interface TextboxDisplayProps {
  text: string;
  className?: string;
  onClose?: () => void; // Optional: for a close button if displayed directly on chart
  isPersisted?: boolean; // Optional: to style differently or add close button
}

export const TextboxDisplay: React.FC<TextboxDisplayProps> = ({ text, className, onClose, isPersisted }) => {
  return (
    <div className={`relative ${isPersisted ? 'p-2 border border-gray-300 bg-white shadow-lg rounded-md' : ''} ${className || ''}`}>
      {isPersisted && onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 right-1 p-0.5 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800 z-10"
          aria-label="Close analysis"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      <pre
        className={`text-sm text-gray-700 whitespace-pre-wrap font-sans overflow-auto custom-scrollbar ${isPersisted ? 'max-h-32 bg-transparent p-1 pt-2' : 'bg-gray-50 p-3 rounded-md border border-gray-200'}`}
      >
        {text}
      </pre>
    </div>
  );
};