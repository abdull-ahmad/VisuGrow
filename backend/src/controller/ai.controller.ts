import { RequestHandler } from "express";
import OpenAI from "openai";
import { cleanupOldConversations, findRowsWithNulls, generateConversationId, getContextRows, isDataCleaningRequest } from "../utils/aiHelpers";
import { fileDataStore } from "../Types/types";


const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

export const getLLMAnalysis: RequestHandler = async (req, res) => {
    try {
        const { chartType, xParameter, yParameter, title, data } = req.body;

        if (!chartType || !xParameter || !yParameter || !data) {
            return res.status(400).json({ error: 'Missing required chart data fields (chartType, xParameter, yParameter, data).' });
        }
        let dataStringForPrompt: string;
        if (typeof data === 'string') {
            
            dataStringForPrompt = data;
        } else if (data && (Array.isArray(data) || typeof data === 'object')) {
            const jsonData = JSON.stringify(data, null, 2);
            dataStringForPrompt = `Data:\n${jsonData}`;
        } else {
            dataStringForPrompt = "Data: Not provided or in an unexpected format.";
        }

        const prompt = `
            Analyze the following chart data.
            Chart Title: "${title || `${yParameter} by ${xParameter}`}"
            Chart Type: ${chartType}
            X-Axis (Primary Parameter): ${xParameter}
            Y-Axis (Secondary Parameter): ${yParameter}

            ${dataStringForPrompt}

            Provide a concise textual analysis (around 3-5 key bullet points or a short paragraph) highlighting:
            - Key trends or patterns observed.
            - Any significant outliers or anomalies.
            - Potential insights or conclusions that can be drawn from this data.
            Keep the language clear and actionable. Do not repeat the input parameters in your analysis.
        `;

        // 3. Call the LLM API
        console.log("Sending prompt to LLM..."); // For server logs
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-r1:free",
            messages: [
                {
                    role: "system",
                    content: `You are an expert-level Pakistani data analyst. Your primary goal is to provide insightful, objective, and actionable analysis based *solely* on the data provided. 
        
        Key characteristics of your analysis should include:
        1.  **Precision and Objectivity**: Base all observations directly on the data. Avoid speculation. If data is insufficient for a conclusion, state it.
        2.  **Clarity and Conciseness**: Use clear, professional language. Get straight to the point.
        3.  **Actionable Insights**: Focus on what the data implies for decision-making or further investigation.
        4.  **Identification of Key Elements**: Clearly identify significant trends, patterns, correlations, anomalies, or outliers.
        5.  **Contextual Awareness**: Consider Pakistan's diverse seasonal patterns and multicultural context when interpreting data, including:
            - Islamic events: Ramadan, Eid ul-Fitr, Eid ul-Adha, Muharram, Milad un Nabi
            - Christian celebrations: Christmas, Easter
            - Hindu festivals: Diwali, Holi
            - Sikh celebrations: Baisakhi, Guru Nanak Jayanti
            - National holidays: Independence Day (14 August), Pakistan Day (23 March)
            - Seasonal factors: Monsoon season (July-September), winter shopping season (December)
            - Wedding seasons: typically post-Eid periods and winter months
        6.  **Structured Output**: Present your findings in a logical, easy-to-understand manner, adhering to the format requested in the user prompt.
        
        When relevant, note how religious events, cultural festivals and seasonal factors might explain patterns in the data. For example, retail sales spikes before Eid, Christmas, or Diwali celebrations; decreased productivity during Ramadan; or increased travel during major holidays across different communities.
        
        Consider how data patterns might reflect Pakistan's religious diversity and regional variations. Be sensitive to how different communities and their celebrations might influence business metrics, consumer behavior, or other trends in the data.
        
        Do not invent data or make assumptions beyond what is explicitly given. Your tone should be authoritative yet helpful.`
                },
                { role: "user", content: prompt }
            ],
        });

        const analysis = completion.choices[0]?.message?.content?.trim();

        if (!analysis) {
            console.error("LLM response was empty or malformed.");
            return res.status(500).json({ error: 'Failed to get a valid analysis from the AI model.' });
        }

        // 4. Send Response to Frontend
        console.log("Successfully received analysis from LLM.");
        res.json({ analysis: analysis });

    } catch (error: any) {
        console.error('Error in /api/analyze-chart-data:', error);
        let errorMessage = 'An internal server error occurred during analysis.';
        let statusCode = 500;

        if (error.response && error.response.data && error.response.data.error) { // OpenAI specific error
            errorMessage = error.response.data.error.message;
            statusCode = error.response.status || 500;
        } else if (error.message) {
            errorMessage = error.message;
        }

        // Check for specific OpenAI error types if using their SDK directly
        if (error instanceof OpenAI.APIError) {
            errorMessage = error.message;
            statusCode = error.status || 500;
            console.error("OpenAI API Error:", error.name, error.status, error.headers, error.error);
        }

        res.status(statusCode).json({ error: errorMessage });
    }
}

// Initialize data analysis - only send data once
export const initializeDataAnalysis: RequestHandler = async (req, res) => {
    try {
        const { fileName, data, columns } = req.body;

        if (!data || !Array.isArray(data) || !columns || !fileName) {
            return res.status(400).json({ error: 'Missing required data fields' });
        }

        // Generate conversation ID
        const conversationId = generateConversationId();

        // Pre-calculate data statistics for faster future analysis
        const nullInfo = findRowsWithNulls(data);

        // Store the data with statistics
        fileDataStore[conversationId] = {
            data,
            fileName,
            columns,
            lastAccessed: new Date(),
            dataStats: {
                rowCount: data.length,
                nullCounts: nullInfo.columnsWithNulls.reduce((acc, col) => {
                    acc[col] = nullInfo.nullRows.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length;
                    return acc;
                }, {} as Record<string, number>)
            }
        };

        // Occasionally clean up old conversations
        if (Math.random() < 0.1) {
            cleanupOldConversations();
        }

        res.json({
            message: `Data analysis session initialized for ${fileName}. You can now ask questions about this data.`,
            conversationId
        });

    } catch (error: any) {
        console.error('Error in /api/ai/initialize-data-analysis:', error);
        res.status(500).json({ error: 'Failed to initialize data analysis session' });
    }
};

// Query data without resending the whole dataset
export const queryData: RequestHandler = async (req, res) => {
    try {
        const { usermessage, conversationId } = req.body;

        if (!usermessage || !conversationId) {
            return res.status(400).json({ error: 'Missing required fields: usermessage and conversationId' });
        }

        
        if (!fileDataStore[conversationId]) {
            return res.status(404).json({ error: 'Conversation not found. Please initialize data analysis first.' });
        }

        // Update last accessed time
        fileDataStore[conversationId].lastAccessed = new Date();

        // Get stored data
        const { data: actualData, fileName: actualFileName, columns: actualColumns } = fileDataStore[conversationId];

        // Determine if this is a cleaning or analysis request
        const isCleaningRequest = isDataCleaningRequest(usermessage);

        // Prepare data based on request type
        let dataForLLM: any[];
        let additionalContext = '';

        if (isCleaningRequest) {
            // For cleaning requests, find rows with nulls and add context
            const { nullRows, nullIndices, columnsWithNulls } = findRowsWithNulls(actualData);

            if (nullRows.length === 0) {
                // No null values found - send sample rows
                dataForLLM = actualData;
                additionalContext = "Note: I checked the data and didn't find any null or empty values.";
            } else {
                // Get null rows plus context rows
                dataForLLM = getContextRows(actualData, nullIndices);
                additionalContext = `
I've identified ${nullRows.length} rows with missing values out of ${actualData.length} total rows.
The following columns have missing values: ${columnsWithNulls.join(', ')}.
I'm providing you with these rows plus surrounding context (${dataForLLM.length} rows total).
Each row includes a __rowIndex property showing its original position in the dataset.`;
            }
        } else {
            // For analysis requests, use a representative sample
            if (actualData.length > 1000) {
                // For very large datasets, send a representative sample
                const sampleSize = 200;
                const step = Math.max(1, Math.floor(actualData.length / sampleSize));
                dataForLLM = [];

                for (let i = 0; i < actualData.length; i += step) {
                    dataForLLM.push(actualData[i]);
                    if (dataForLLM.length >= sampleSize) break;
                }

                additionalContext = `
Note: This is a sample of ${dataForLLM.length} rows from the total ${actualData.length} rows.
The sample was created by selecting rows at regular intervals across the dataset.`;
            } else {
                // For smaller datasets, use all data
                dataForLLM = actualData;
            }
        }

        // Prepare system prompt
        const systemPrompt = `You are an expert data analyst assistant that helps users understand and clean their data. 
        
You have two main functions:
1. Data Analysis: When users ask for insights or analysis, provide them with a clear, concise analysis.
2. Data Cleaning: When users ask to fix data issues, you must respond in a special format that allows the application to update the data.

${isCleaningRequest ? `
For data cleaning operations:
- Your response must include a JSON block wrapped between [DATA_UPDATE] and [/DATA_UPDATE] tags
- Inside this block, provide a valid JSON array containing the updated rows
- Each row must include the __rowIndex property to identify its original position
- Only include modified rows in your update
- Make sure your JSON is valid and properly formatted

Example of a valid cleaning response:
"I've filled the missing values in the 'revenue' column by calculating the average.

[DATA_UPDATE]
[
  {"__rowIndex": 5, "name": "Product A", "revenue": 1250, "category": "Electronics"},
  {"__rowIndex": 12, "name": "Product B", "revenue": 1250, "category": "Home"}
]
[/DATA_UPDATE]

The missing values have been filled with the average revenue of 1250."
` : ''}

The file being analyzed is "${actualFileName}".`;

        // Construct the prompt for the LLM
        let userPrompt = `I'm analyzing this file: "${actualFileName}" with ${actualData.length} rows and ${actualColumns.length} columns.

Column Names: ${actualColumns.join(', ')}

${additionalContext}

Here's ${isCleaningRequest ? 'the relevant data' : 'a preview of the data'}:
${JSON.stringify(dataForLLM, null, 2)}

User's request: "${usermessage}"`;

        // Call the LLM API
        console.log(`Sending ${isCleaningRequest ? 'cleaning' : 'analysis'} request to LLM...`);
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-r1:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });

        const response = completion.choices[0]?.message?.content?.trim();

        if (!response) {
            console.error("LLM response was empty or malformed.");
            return res.status(500).json({ error: 'Failed to get a valid analysis from the AI model.' });
        }

        // Check if response contains data update instructions
        let updatedData: any = null;
        let message = response;

        const dataUpdateRegex = /\[DATA_UPDATE\]([\s\S]*?)\[\/DATA_UPDATE\]/;
        const match = response.match(dataUpdateRegex);

        if (match && match[1]) {
            try {
                // Extract and parse the JSON data
                const jsonStr = match[1].trim();
                const updateRows = JSON.parse(jsonStr);

                // Remove the data update block from the message
                message = response.replace(dataUpdateRegex, '').trim();

                console.log("Data update instructions received from LLM");

                if (Array.isArray(updateRows) && updateRows.length > 0) {
                    // Create a copy of the full dataset
                    updatedData = [...actualData];

                    // Apply each update to the appropriate row
                    updateRows.forEach(updateRow => {
                        const rowIndex = updateRow.__rowIndex;
                        if (rowIndex !== undefined && rowIndex >= 0 && rowIndex < updatedData.length) {
                            // Remove the __rowIndex property before updating
                            const { __rowIndex, ...rowWithoutIndex } = updateRow;
                            // Update the row in the dataset
                            updatedData[rowIndex] = { ...updatedData[rowIndex], ...rowWithoutIndex };
                        }
                    });

                    // Update the stored data
                    fileDataStore[conversationId].data = updatedData;
                }
            } catch (error) {
                console.error("Error parsing data update JSON:", error);
                message = "I found some data issues, but there was an error processing the updates. Please try a more specific request.";
            }
        }

        res.json({
            message: message,
            updatedData: updatedData,
            conversationId
        });

    } catch (error: any) {
        console.error('Error in /api/ai/query-data:', error);
        let errorMessage = 'An error occurred during data analysis.';

        if (error instanceof OpenAI.APIError) {
            errorMessage = error.message;
            console.error("OpenAI API Error:", error.name, error.status, error.headers, error.error);
        }

        res.status(500).json({ error: errorMessage });
    }
};