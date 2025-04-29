import { create } from 'zustand';
import axios from 'axios';
import { useDataStore } from './dataStore';
import { useEcomStore } from './ecomStore';

const FILE_API_URL = 'http://localhost:5000/api/file';
const STORE_API_URL = 'http://localhost:5000/api/store';

// Define a consistent header structure
interface SourceHeader {
  name: string;
  type: string; // e.g., 'string', 'number', 'date'
}

interface DataSourceState {
  dataSourceType: 'file' | 'store' | null;
  selectedSourceId: string | null;
  sourceName: string | null; // Name of the file or store
  sourceData: any[] | null;
  sourceHeaders: SourceHeader[] | null;
  isSourceLoading: boolean;
  sourceError: string | null;

  // Actions
  setDataSource: (type: 'file' | 'store' | null, id: string | null, name: string | null) => void;
  loadSourceData: () => Promise<void>;
  clearSourceData: () => void;
}

const initialState: Omit<DataSourceState, 'setDataSource' | 'loadSourceData' | 'clearSourceData'> = {
  dataSourceType: null,
  selectedSourceId: null,
  sourceName: null,
  sourceData: null,
  sourceHeaders: null,
  isSourceLoading: false,
  sourceError: null,
};

export const useDataSourceStore = create<DataSourceState>((set, get) => ({
  ...initialState,

  setDataSource: (type, id, name) => {
    // Clear previous data if source changes
    if (get().selectedSourceId !== id || get().dataSourceType !== type) {
      set({ ...initialState, dataSourceType: type, selectedSourceId: id, sourceName: name });
    } else {
      set({ dataSourceType: type, selectedSourceId: id, sourceName: name });
    }
  },

  loadSourceData: async () => {
    const { dataSourceType, selectedSourceId } = get();
    if (!dataSourceType || !selectedSourceId) {
      set({ sourceError: "No data source selected", isSourceLoading: false });
      return;
    }

    set({ isSourceLoading: true, sourceError: null, sourceData: null, sourceHeaders: null });

    try {
      let response;
      let headers: SourceHeader[] = [];
      let data: any[] = [];

      if (dataSourceType === 'file') {
        response = await axios.get(`${FILE_API_URL}/fields/${selectedSourceId}`);
        // Ensure backend returns fields (headers) and fileData
        headers = response.data.fields || [];
        data = response.data.fileData || [];
        // Sync fileStore's selected ID if needed
        useDataStore.getState().setSelectedFileId(selectedSourceId);

      } else if (dataSourceType === 'store') {
        // IMPORTANT: Adjust endpoint and response keys based on your Store API implementation
        response = await axios.get(`${STORE_API_URL}/data/${selectedSourceId}`);
        // Expecting { headers: SourceHeader[], data: any[] }
        headers = response.data.headers || []; // Adjust key if needed (e.g., fields)
        data = response.data.data || [];       // Adjust key if needed (e.g., records)
        // Sync ecomStore's selected ID if needed
        useEcomStore.getState().setStoreId(selectedSourceId);
      }

      console.log("Data loaded successfully:", { headers, data });

      set({
        sourceHeaders: headers,
        sourceData: data,
        isSourceLoading: false,
      });

    } catch (error) {
      let errorMessage = "Error loading data source";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || `Error loading ${dataSourceType} data`;
      }
      console.error("Error in loadSourceData:", error);
      set({ sourceError: errorMessage, isSourceLoading: false });
      // Consider re-throwing if error needs handling upstream
      // throw error;
    }
  },

  clearSourceData: () => {
    set(initialState);
    // Optionally reset related states in other stores
    // useDataStore.getState().resetStore(); // Example
  },
}));