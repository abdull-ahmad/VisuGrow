import React, { useEffect, useState } from 'react';
import { useDataStore } from '../../store/dataStore';

export const FilePanel: React.FC = () => {
  const { files, viewFile, fileFields } = useDataStore();
  const [selectedFileId, setSelectedFileId] = useState('');

  useEffect(() => {
    viewFile().catch(console.error);
  }, [viewFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFileId(e.target.value);
  };

  const handleFileOpen = () => {
    if (selectedFileId) {
      fileFields(selectedFileId).catch(console.error);
    }
  };

  return (
    <div className='p-4 border-2 border-gray-200 rounded-lg shadow-sm mainCenter'>
      <h2 className='text-lg font-rowdies mb-4'>Select Dataset</h2>
      <div className='space-y-4'>
        {files?.length === 0 && <p className='text-gray-500'>No files available</p>}
        {files && files.length > 0 && (
          <>
            <select 
              value={selectedFileId} 
              onChange={handleFileSelect}
              className='w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>Choose a file...</option>
              {files.map((file: any) => (
                <option key={file._id} value={file._id}>
                  {file.name}
                </option>
              ))}
            </select>
            <button 
              onClick={handleFileOpen} 
              disabled={!selectedFileId}
              className={`w-full py-2 px-4 customColorButton text-white rounded-md transition-colors ${
                !selectedFileId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Load Dataset
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FilePanel;