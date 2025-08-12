import { RequestHandler } from "express";
import OpenAI from "openai";
import { cleanupOldConversations, findRowsWithNulls, generateConversationId, getContextRows, getDataAnalysisSystemPrompt, getDataCleaningSystemPrompt, getOptimizedUserPrompt, isDataCleaningRequest, smartSampleData } from "../utils/aiHelpers";
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
                    content: `You are an expert-level Pakistani data analyst. Your primary goal is to provide insightful, objective, and actionable analysis and provide future forecast based *solely* on the data provided. 
        
        Key characteristics of your analysis should include:
        1.  **Precision and Objectivity**: Base all observations directly on the data. Avoid speculation. If data is insufficient for a conclusion, state it.
        2.  **Clarity and Conciseness**: Use clear, professional language. Get straight to the point.
        3.  **Actionable Insights**: Focus on what the data implies for decision-making or further investigation.
        4.  **Identification of Key Elements**: Clearly identify significant trends, patterns, correlations, anomalies, or outliers.
        5.  **Contextual Awareness**: Consider Pakistan's diverse seasonal patterns and multicultural context when interpreting data, including:
            - Islamic events: Ramadan, Eid ul-Fitr, Eid ul-Adha, Muharram, Milad un Nabi
            - Christian celebrations: Christmas, Easter
            - Hindu festivals: Diwali, Holi
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

export const queryData: RequestHandler = async (req, res) => {
    try {
        
        const usermessage = req.body.usermessage || req.query.usermessage as string;
        const conversationId = req.body.conversationId || req.query.conversationId as string;

        if (!usermessage || !conversationId) {
            return res.status(400).json({ error: 'Missing required fields: usermessage and conversationId' });
        }
        
        if (!fileDataStore[conversationId]) {
            return res.status(404).json({ error: 'Conversation not found. Please initialize data analysis first.' });
        }

        // Setup streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Helper function to send stream updates
        const sendStreamUpdate = (event: string, data: any) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        // Send initial message to client
        sendStreamUpdate('status', { message: 'Processing request...' });

        // Update last accessed time
        fileDataStore[conversationId].lastAccessed = new Date();

        // Get stored data
        const { data: actualData, fileName: actualFileName, columns: actualColumns, dataStats } = fileDataStore[conversationId];

        // Determine if this is a cleaning or analysis request
        const isCleaningRequest = isDataCleaningRequest(usermessage);
        
        // Send analysis type to client
        sendStreamUpdate('status', { 
            message: `Starting ${isCleaningRequest ? 'data cleaning' : 'data analysis'}...`,
            analysisType: isCleaningRequest ? 'cleaning' : 'analysis'
        });

        // Prepare data efficiently based on request type
        let dataForLLM: any[];
        let additionalContext = '';

        if (isCleaningRequest) {
            // For cleaning requests, we already have nullInfo in dataStats
            if (!dataStats?.nullCounts||Object.keys(dataStats.nullCounts).length === 0) {
                // No null values found - send a smaller sample
                dataForLLM = actualData.slice(0, Math.min(50, actualData.length));
                additionalContext = "Note: I checked the data and didn't find any null or empty values.";
            } else {
                // Get only rows with nulls plus minimal context (more efficient)
                const nullColumns = !dataStats?.nullCounts ||Object.keys(dataStats.nullCounts);
                const nullIndices = actualData.reduce((indices, row, idx) => {
                    if (nullColumns.some(col => row[col] === null || row[col] === undefined || row[col] === ''))
                        indices.push(idx);
                    return indices;
                }, [] as number[]);
                
                dataForLLM = getContextRows(actualData, nullIndices, 2); // Reduced context rows
                additionalContext = `
I've identified rows with missing values out of ${actualData.length} total rows.
The following columns have missing values: ${nullColumns.join(', ')} with counts: ${
                    nullColumns.map(col => `${col}: ${(dataStats.nullCounts ?? {})[col]}`).join(', ')
                }.
I'm providing these rows plus minimal surrounding context.`;
            }
        } else {
            // For analysis requests, use a smarter sampling strategy
            if (actualData.length > 500) {
                // Sample based on data characteristics
                dataForLLM = smartSampleData(actualData, 100); // Using a new helper function
                additionalContext = `
Note: This is an intelligent sample of ${dataForLLM.length} rows from the total ${actualData.length} rows.
The sample was created to represent the data distribution effectively.`;
            } else {
                // For smaller datasets, use all data
                dataForLLM = actualData;
            }
        }

        sendStreamUpdate('status', { message: 'Data prepared, sending to AI model...' });

        // Prepare optimized system prompt - concise and focused
        const systemPrompt = isCleaningRequest 
            ? getDataCleaningSystemPrompt(actualFileName)
            : getDataAnalysisSystemPrompt(actualFileName);

        // Construct a more efficient user prompt
        const userPrompt = getOptimizedUserPrompt(
            actualFileName, 
            actualData.length,
            actualColumns,
            dataForLLM,
            additionalContext,
            usermessage,
            isCleaningRequest
        );

        // Call OpenAI with streaming
        const stream = await openai.chat.completions.create({
            model: "deepseek/deepseek-r1:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            stream: true,
        });

        let fullResponse = '';
        let streamingStarted = false;
        
        // Process the stream
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                
                // Send the chunk to the client
                if (!streamingStarted) {
                    sendStreamUpdate('start', { message: 'Receiving response from AI...' });
                    streamingStarted = true;
                }
                
                sendStreamUpdate('chunk', { content });
            }
        }

        // Check if response contains data update instructions
        const dataUpdateRegex = /\[DATA_UPDATE\]([\s\S]*?)\[\/DATA_UPDATE\]/;
        const match = fullResponse.match(dataUpdateRegex);
        let updatedData: any = null;

        if (match && match[1] && isCleaningRequest) {
            try {
                // Extract and parse the JSON data
                const jsonStr = match[1].trim();
                const updateRows = JSON.parse(jsonStr);
                
                // Send status update
                sendStreamUpdate('status', { message: 'Processing data updates...' });

                // Remove the data update block from the message for display
                const cleanMessage = fullResponse.replace(dataUpdateRegex, '').trim();
                
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
                    
                    // Recalculate data statistics
                    const nullInfo = findRowsWithNulls(updatedData);
                    fileDataStore[conversationId].dataStats = {
                        rowCount: updatedData.length,
                        nullCounts: nullInfo.columnsWithNulls.reduce((acc, col) => {
                            acc[col] = nullInfo.nullRows.filter(row => 
                                row[col] === null || row[col] === undefined || row[col] === '').length;
                            return acc;
                        }, {} as Record<string, number>)
                    };
                    
                    // Send final update with the cleaned message and updated data
                    sendStreamUpdate('complete', {
                        message: cleanMessage,
                        updatedData: updatedData
                    });
                }
            } catch (error) {
                console.error("Error parsing data update JSON:", error);
                sendStreamUpdate('error', { 
                    message: "I found some data issues, but there was an error processing the updates. Please try a more specific request."
                });
            }
        } else {
            // Send final message without data updates
            sendStreamUpdate('complete', { 
                message: fullResponse,
                updatedData: null
            });
        }
        
        // End the response
        res.end();

    } catch (error: any) {
        console.error('Error in /api/ai/query-data:', error);
        let errorMessage = 'An error occurred during data analysis.';

        if (error instanceof OpenAI.APIError) {
            errorMessage = error.message;
            console.error("OpenAI API Error:", error.name, error.status, error.headers, error.error);
        }
        
        // Try to send error response, but check if headers have been sent
        if (!res.headersSent) {
            res.status(500).json({ error: errorMessage });
        } else {
            // If streaming has already started, send error as event
            res.write(`event: error\n`);
            res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
            res.end();
        }
    }
};