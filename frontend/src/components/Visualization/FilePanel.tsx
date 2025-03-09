import React, { useEffect, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, Database, Upload, Inbox } from 'lucide-react';

export const FilePanel: React.FC = () => {
  const { 
    files, 
    viewFile, 
    fileFields, 
    selectedFileId, 
    setSelectedFileId, 
    isFileLoading 
  } = useDataStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    viewFile().catch(console.error);
  }, [viewFile]);

  const handleFileSelect = (fileId: string, fileName: string) => {
    setSelectedFileId(fileId);
    setIsDropdownOpen(false);
  };

  const handleFileOpen = async () => {
    if (selectedFileId) {
      try {
        await fileFields(selectedFileId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Find the name of the selected file
  const selectedFileName = files?.find((file: any) => file._id === selectedFileId)?.name;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center mb-5">
        <Database className="w-6 h-6 text-[#053252] mr-3" />
        <h2 className="text-xl font-rowdies text-gray-800">Dataset Selection</h2>
      </div>
      
      <div className="space-y-5">
        {files && files.length > 0 ? (
          <>
            {/* Custom styled dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border ${isDropdownOpen ? 'border-[#053252] ring-2 ring-blue-100' : 'border-gray-200'} rounded-lg text-left transition-all duration-200`}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <div className="flex items-center">
                  <FileText className={`w-5 h-5 mr-3 ${selectedFileId ? 'text-[#053252]' : 'text-gray-400'}`} />
                  <span className={selectedFileId ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedFileName || 'Choose a dataset...'}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg"
                    role="listbox"
                  >
                    {files.map((file: any) => (
                      <motion.li 
                        key={file._id} 
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        className={`px-4 py-3 cursor-pointer flex items-center ${file._id === selectedFileId ? 'bg-blue-50 text-[#053252]' : 'text-gray-700'}`}
                        onClick={() => handleFileSelect(file._id, file.name)}
                        role="option"
                        aria-selected={file._id === selectedFileId}
                      >
                        <FileText className="w-4 h-4 mr-3" />
                        <span className="truncate">{file.name}</span>
                        {file._id === selectedFileId && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto bg-[#053252] rounded-full w-2 h-2"
                          ></motion.span>
                        )}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button 
              onClick={handleFileOpen} 
              disabled={!selectedFileId || isFileLoading}
              whileHover={{ scale: selectedFileId ? 1.02 : 1 }}
              whileTap={{ scale: selectedFileId ? 0.98 : 1 }}
              className={`w-full py-3 px-4 flex items-center justify-center rounded-lg text-white font-medium transition-all ${
                !selectedFileId ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#053252] hover:bg-[#0a4470] shadow-md hover:shadow-lg'
              }`}
            >
              {isFileLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading Dataset...
                </div>
              ) : (
                <>
                  <Database className="mr-2 w-5 h-5" /> 
                  Load Dataset
                </>
              )}
            </motion.button>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center"
          >
            <Inbox className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No datasets available</h3>
            <p className="text-gray-500 mb-4">Upload your first dataset to begin visualization</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = '/upload'}
              className="bg-[#053252] hover:bg-[#0a4470] text-white font-medium py-2 px-4 rounded-lg flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Dataset
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FilePanel;