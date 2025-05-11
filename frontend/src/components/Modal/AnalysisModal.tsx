import React from 'react';
import { Sparkles, X as CloseIcon, Activity, FileText, PlusSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // For GitHub-flavored markdown (e.g., tables, strikethrough)

interface AnalysisModalProps {
  isOpen: boolean;
  isLoading: boolean;
  analysisText: string | null;
  chartTitle: string;
  onClose: () => void;
  onPersistAnalysis: (text: string) => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  isLoading,
  analysisText,
  chartTitle,
  onClose,
  onPersistAnalysis,
}) => {
  if (!isOpen) {
    return null;
  }

  const handlePersistClick = () => {
    if (analysisText) {
      onPersistAnalysis(analysisText);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[1050]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[85vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <Sparkles size={20} className="mr-2 text-blue-500" />
            AI Analysis: {chartTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar min-h-[100px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Activity size={36} className="animate-spin text-blue-500" />
              <p className="mt-3 text-sm text-gray-600">Generating insights, please wait...</p>
            </div>
          )}
          {!isLoading && analysisText && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]} // Enable GitHub-flavored markdown
            >
              {analysisText}
            </ReactMarkdown>
          )}
          {!isLoading && !analysisText && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText size={36} className="text-gray-400" />
              <p className="mt-3 text-sm text-gray-500">No analysis available or an error occurred.</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handlePersistClick}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !analysisText}
            title="Add this analysis as a note on the chart"
          >
            <PlusSquare size={16} className="mr-2" />
            Add to Canvas
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};