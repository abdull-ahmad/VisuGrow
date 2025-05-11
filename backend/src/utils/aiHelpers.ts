import { fileDataStore } from "../Types/types";

export const generateConversationId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Clean up old conversations
export const cleanupOldConversations = () => {
    const now = new Date();
    const expiryTime = 30 * 60 * 1000; // 30 minutes

    Object.keys(fileDataStore).forEach(id => {
        if (now.getTime() - fileDataStore[id].lastAccessed.getTime() > expiryTime) {
            delete fileDataStore[id];
        }
    });
};

// Determine if a request is for data cleaning or analysis
export const isDataCleaningRequest = (message: string): boolean => {
    const cleaningKeywords = [
        'clean', 'null', 'missing', 'empty', 'fill', 'replace', 'fix',
        'update', 'modify', 'change', 'remove', 'delete', 'transform',
        'convert', 'format', 'standardize', 'normalize'
    ];

    const lowercaseMessage = message.toLowerCase();
    return cleaningKeywords.some(keyword => lowercaseMessage.includes(keyword));
};

// Find rows with null values
export const findRowsWithNulls = (data: any[], columns?: string[]): {
    nullRows: any[],
    nullIndices: number[],
    columnsWithNulls: string[]
} => {
    const nullIndices: number[] = [];
    const columnsWithNulls: Set<string> = new Set();

    data.forEach((row, index) => {
        const columnsToCheck = columns || Object.keys(row);
        let hasNull = false;

        columnsToCheck.forEach(col => {
            if (row[col] === null || row[col] === undefined || row[col] === '') {
                hasNull = true;
                columnsWithNulls.add(col);
            }
        });

        if (hasNull) {
            nullIndices.push(index);
        }
    });

    const nullRows = nullIndices.map(index => data[index]);

    return {
        nullRows,
        nullIndices,
        columnsWithNulls: Array.from(columnsWithNulls)
    };
};

// Get context rows around null rows
export const getContextRows = (data: any[], nullIndices: number[], contextSize: number = 20): any[] => {
    const contextIndices = new Set<number>();

    nullIndices.forEach(index => {
        const start = Math.max(0, index - contextSize);
        const end = Math.min(data.length - 1, index + contextSize);

        for (let i = start; i <= end; i++) {
            contextIndices.add(i);
        }
    });

    return Array.from(contextIndices).sort((a, b) => a - b).map(index => ({
        ...data[index],
        __rowIndex: index // Add the original index for reference
    }));
};