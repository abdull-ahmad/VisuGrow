import { RequestHandler } from "express";
import OpenAI from "openai";

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
            // This case might occur if the frontend accidentally sends a stringified JSON already.
            // Or if the data is genuinely just a string.
            dataStringForPrompt = data; 
        } else if (data && (Array.isArray(data) || typeof data === 'object')) {
            // Convert the entire data object/array to a JSON string.
            // Using null, 2 for pretty printing, which can help LLM readability.
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
                    content: `You are an expert-level data analyst. Your primary goal is to provide insightful, objective, and actionable analysis based *solely* on the data provided. 
                    
                    Key characteristics of your analysis should include:
                    1.  **Precision and Objectivity**: Base all observations directly on the data. Avoid speculation. If data is insufficient for a conclusion, state it.
                    2.  **Clarity and Conciseness**: Use clear, professional language. Get straight to the point.
                    3.  **Actionable Insights**: Focus on what the data implies for decision-making or further investigation.
                    4.  **Identification of Key Elements**: Clearly identify significant trends, patterns, correlations, anomalies, or outliers.
                    5.  **Contextual Awareness**: While you only have the provided data, interpret it as a professional analyst would, considering common business or data contexts.
                    6.  **Structured Output**: Present your findings in a logical, easy-to-understand manner, adhering to the format requested in the user prompt.
                    
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

    } catch (error:any ) {
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