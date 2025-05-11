export const fileDataStore: Record<string, {
    data: any[];
    fileName: string;
    columns: string[];
    lastAccessed: Date;
    dataStats?: {
        rowCount: number;
        nullCounts?: Record<string, number>;
    };
}> = {};
