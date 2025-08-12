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

// Add these new helper functions to your aiHelpers.ts file

/**
 * Creates a smarter sample of data that preserves distribution characteristics
 */
export function smartSampleData(data: any[], targetSampleSize: number): any[] {
    if (data.length <= targetSampleSize) return data;
    
    const sample: any[] = [];
    
    // Always include the first and last rows
    sample.push({...data[0], __rowIndex: 0});
    
    // Select rows at variable intervals to get representative sample
    const step = Math.max(1, Math.floor(data.length / (targetSampleSize - 2)));
    
    for (let i = step; i < data.length - step; i += step) {
        sample.push({...data[i], __rowIndex: i});
    }
    
    // Add the last row
    sample.push({...data[data.length - 1], __rowIndex: data.length - 1});
    
    // If we have room for more samples, add some randomly distributed rows
    // to catch potential outliers or interesting data points
    if (sample.length < targetSampleSize) {
        const remaining = targetSampleSize - sample.length;
        const usedIndices = new Set(sample.map(row => row.__rowIndex));
        
        let attempts = 0;
        while (sample.length < targetSampleSize && attempts < data.length) {
            // Pick random index but avoid already selected ones
            const randomIndex = Math.floor(Math.random() * data.length);
            if (!usedIndices.has(randomIndex)) {
                sample.push({...data[randomIndex], __rowIndex: randomIndex});
                usedIndices.add(randomIndex);
            }
            attempts++;
        }
    }
    
    return sample;
}

/**
 * Get an optimized system prompt for data cleaning
 */
export function getDataCleaningSystemPrompt(fileName: string): string {
    return `You are a Pakistani data cleaning expert. When users ask to fix data issues, respond with:
1. A brief explanation of what you're fixing
2. A JSON block with fixed data wrapped between [DATA_UPDATE] and [/DATA_UPDATE] tags
3. Each updated row must include __rowIndex property
4. Only include modified rows in your update
5. Ensure your JSON is valid and properly formatted

Example format:
"I've filled missing values in the 'revenue' column.

[DATA_UPDATE]
[
  {"__rowIndex": 5, "revenue": 1250},
  {"__rowIndex": 12, "revenue": 1250}
]
[/DATA_UPDATE]

The missing values were filled with average revenue."

The file being analyzed is "${fileName}".`;
}

/**
 * Get an optimized system prompt for data analysis
 */
export function getDataAnalysisSystemPrompt(fileName: string): string {
    return `You are a data analysis expert. When analyzing data, provide:
1. Clear, concise insights about patterns, trends, or anomalies
2. 3-5 key observations in bullet points when appropriate
3. Focus on what the data reveals without speculation

The file being analyzed is "${fileName}".`;
}

/**
 * Create an optimized user prompt
 */
export function getOptimizedUserPrompt(
    fileName: string,
    totalRows: number,
    columns: string[],
    dataForLLM: any[],
    additionalContext: string,
    userMessage: string,
    isCleaningRequest: boolean
): string {
    return `Analyzing file: "${fileName}" (${totalRows} rows, ${columns.length} columns)
Columns: ${columns.join(', ')}

${additionalContext}

${isCleaningRequest ? 'Data requiring attention:' : 'Data sample:'}
${JSON.stringify(dataForLLM, null, 1)}

User request: "${userMessage}"

${isCleaningRequest ? 'Remember to provide data updates in the [DATA_UPDATE] format.' : 'Provide concise analysis focusing on insights revealed by this data.'}`;
}