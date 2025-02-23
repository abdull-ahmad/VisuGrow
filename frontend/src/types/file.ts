export interface DataStore {
    fileName: string;
    fileData : any;
    fileHeaders: any;
    files: any[];
    message: string | null;
    fileerror: string | null;
    isFileLoading: boolean;
    saveFile: (data: { rows: any; columns: any; fileName: string }) => Promise<void>;
    editFile: (data: { rows: any; columns: any; fileId: string }) => Promise<void>;
    openFile: (fileId: string) => Promise<void>;
    deleteFile: (fileId: string) => Promise<void>;
    viewFile: () => Promise<void>;
};
