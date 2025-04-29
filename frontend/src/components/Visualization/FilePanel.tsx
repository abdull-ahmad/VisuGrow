import React, { useEffect, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useEcomStore } from '../../store/ecomStore'; // Import ecom store
import { useDataSourceStore } from '../../store/dataSourceStore'; // Import data source store
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, Database, Upload, Inbox, Store, Check, AlertCircle } from 'lucide-react'; // Added Store, Check, AlertCircle icons

export const FilePanel: React.FC = () => {
  // Stores for listing sources
  const { files, viewFile: viewFiles } = useDataStore();
  const { stores, fetchStores } = useEcomStore();

  // Central store for managing the active source
  const {
    dataSourceType,
    selectedSourceId,
    sourceName,
    isSourceLoading,
    sourceError,
    setDataSource,
    loadSourceData,
  } = useDataSourceStore();

  // Local state for UI control
  const [selectedType, setSelectedType] = useState<'file' | 'store' | null>(dataSourceType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch available files and stores on component mount
  useEffect(() => {
    viewFiles().catch(console.error);
    fetchStores().catch(console.error);
  }, [viewFiles, fetchStores]);

  // Sync local type selection with global state
  useEffect(() => {
    setSelectedType(dataSourceType);
  }, [dataSourceType]);

  // Handle changing the source type (File vs Store)
  const handleTypeChange = (type: 'file' | 'store') => {
    if (type !== selectedType) {
      setSelectedType(type);
      setDataSource(type, null, null); // Reset selection in the store
      setIsDropdownOpen(false);
    }
  };

  // Handle selecting a specific file or store from the dropdown
  const handleSourceSelect = (id: string, name: string) => {
    if (selectedType) {
      setDataSource(selectedType, id, name); // Set selection in the store
      setIsDropdownOpen(false);
    }
  };

  // Handle clicking the "Load Data Source" button
  const handleLoadClick = async () => {
    if (selectedSourceId && dataSourceType) {
      await loadSourceData(); // Trigger data loading action
    }
  };

  // Get the list of items (files or stores) for the dropdown
  const getDropdownItems = () => {
    if (selectedType === 'file') return files || [];
    if (selectedType === 'store') return stores || [];
    return [];
  };

  // Helper to get ID (assuming _id for both)
  const getItemId = (item: any): string => item?._id ?? '';
  // Helper to get Name (assuming name for both)
  const getItemName = (item: any): string => item?.name ?? 'Unnamed';

  const currentSelectionName = sourceName || (selectedType === 'file' ? 'Choose a file...' : selectedType === 'store' ? 'Choose a store...' : 'Select source type...');
  const itemsAvailable = getDropdownItems().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center mb-5">
        <Database className="w-6 h-6 text-[#053252] mr-3" />
        <h2 className="text-xl font-rowdies text-gray-800">Data Source</h2>
      </div>

      <div className="space-y-4">
        {/* Source Type Selection Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTypeChange('file')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              selectedType === 'file'
                ? 'bg-blue-50 border-[#053252] text-[#053252] font-medium ring-1 ring-[#053252]'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText size={16} /> File
          </button>
          <button
            onClick={() => handleTypeChange('store')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              selectedType === 'store'
                ? 'bg-blue-50 border-[#053252] text-[#053252] font-medium ring-1 ring-[#053252]'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Store size={16} /> Store API
          </button>
        </div>

        {/* Source Selection Dropdown */}
        {selectedType && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={!itemsAvailable}
              className={`w-full flex items-center justify-between px-4 py-3 bg-white border ${isDropdownOpen ? 'border-[#053252] ring-2 ring-blue-100' : 'border-gray-200'} rounded-lg text-left transition-all duration-200 ${!itemsAvailable ? 'cursor-not-allowed bg-gray-50 opacity-70' : 'hover:border-gray-400'}`}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
              <div className="flex items-center truncate">
                 {selectedType === 'file' ? <FileText className={`w-5 h-5 mr-3 flex-shrink-0 ${selectedSourceId ? 'text-[#053252]' : 'text-gray-400'}`} /> : <Store className={`w-5 h-5 mr-3 flex-shrink-0 ${selectedSourceId ? 'text-[#053252]' : 'text-gray-400'}`} />}
                <span className={`truncate ${selectedSourceId ? 'text-gray-900' : 'text-gray-500'}`}>
                  {itemsAvailable ? currentSelectionName : `No ${selectedType}s available`}
                </span>
              </div>
              {itemsAvailable && <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />}
            </button>

            <AnimatePresence>
              {isDropdownOpen && itemsAvailable && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg"
                  role="listbox"
                >
                  {getDropdownItems().map((item: any) => {
                    const itemId = getItemId(item);
                    const itemName = getItemName(item);
                    return (
                      <motion.li
                        key={itemId}
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        className={`px-4 py-3 cursor-pointer flex items-center text-sm ${itemId === selectedSourceId ? 'bg-blue-50 text-[#053252] font-medium' : 'text-gray-700'}`}
                        onClick={() => handleSourceSelect(itemId, itemName)}
                        role="option"
                        aria-selected={itemId === selectedSourceId}
                      >
                        {selectedType === 'file' ? <FileText className="w-4 h-4 mr-3 flex-shrink-0" /> : <Store className="w-4 h-4 mr-3 flex-shrink-0" />}
                        <span className="truncate flex-grow">{itemName}</span>
                        {itemId === selectedSourceId && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-[#053252] flex-shrink-0">
                             <Check size={16} />
                          </motion.span>
                        )}
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Load Button */}
        {selectedType && (
          <motion.button
            onClick={handleLoadClick}
            disabled={!selectedSourceId || isSourceLoading}
            whileHover={{ scale: selectedSourceId && !isSourceLoading ? 1.02 : 1 }}
            whileTap={{ scale: selectedSourceId && !isSourceLoading ? 0.98 : 1 }}
            className={`w-full py-3 px-4 flex items-center justify-center rounded-lg text-white font-medium transition-all text-sm ${
              !selectedSourceId ? 'bg-gray-300 cursor-not-allowed' : isSourceLoading ? 'bg-blue-400 cursor-wait' : 'bg-[#053252] hover:bg-[#0a4470] shadow-md hover:shadow-lg'
            }`}
          >
            {isSourceLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Data...
              </>
            ) : (
              <>
                <Database className="mr-2 w-5 h-5" />
                Load Data Source
              </>
            )}
          </motion.button>
        )}

        {/* Error Message Display */}
        {sourceError && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 bg-red-50 border border-red-200 rounded-md p-3 text-sm flex items-center gap-2"
            >
                <AlertCircle size={16} className="flex-shrink-0"/>
                <span>{sourceError}</span>
            </motion.div>
        )}

        {/* Placeholder when no type is selected */}
        {!selectedType && (
          <div className="text-center py-6 text-gray-500">
            Select a source type above.
          </div>
        )}

         {/* Placeholder when type selected but no items */}
         {selectedType && !itemsAvailable && !isSourceLoading && (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center"
            >
                <Inbox className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="text-md font-medium text-gray-700 mb-1">No {selectedType === 'file' ? 'Datasets' : 'Stores'} Found</h3>
                <p className="text-sm text-gray-500 mb-4">
                    {selectedType === 'file'
                        ? 'Upload a dataset via the upload page.'
                        : 'Connect a store via the settings page.'}
                </p>
                {/* Optional: Add link/button to upload/settings */}
            </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FilePanel;