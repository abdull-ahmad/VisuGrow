import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertTriangle } from 'lucide-react';
import { dateColumn } from 'react-datasheet-grid';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FileDataChatBoxProps {
  rowData: any[];
  colDefs: any[];
  fileName: string;
  onDataUpdate: (newData: any[]) => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  pending?: boolean;
}

const FileDataChatBox: React.FC<FileDataChatBoxProps> = ({ rowData, colDefs, fileName, onDataUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'I can help you analyze this file or make changes to the data. Try asking something like "Analyze this data" or "Remove null values from column X".'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Add conversation ID to track this data analysis session
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update the handleSendMessage function

const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;

  // Add user message to chat
  const userMessage = { role: 'user' as const, content: inputMessage };
  setMessages(prev => [...prev, userMessage]);

  // Add temporary assistant message
  const pendingMessage = { role: 'assistant' as const, content: '...', pending: true };
  setMessages(prev => [...prev, pendingMessage]);

  setInputMessage('');
  setIsLoading(true);

  try {
    // First message - initialize data analysis
    if (!conversationId) {
      // Prepare column titles for the API
      const columnTitles = colDefs.map(col => col.title || '');
      
      // Initialize data analysis
      const initResponse = await axios.post('http://localhost:5000/api/ai/initialize-data-analysis', {
        fileName,
        data: rowData,
        columns: columnTitles
      });
      
      // Save conversation ID
      const newConversationId = initResponse.data.conversationId;
      setConversationId(newConversationId);
      
      // Now handle the streaming query
      handleStreamingQuery(userMessage.content, newConversationId);
    } else {
      // Subsequent message - just query with streaming
      handleStreamingQuery(userMessage.content, conversationId);
    }
  } catch (error) {
    console.error('Error sending message to AI:', error);

    // Remove pending message
    setMessages(prev => prev.filter(msg => !msg.pending));

    // Add error message
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.'
      }
    ]);
    
    setIsLoading(false);
  }
};

// Update the handleStreamingQuery function

// Helper function to handle streaming responses
const handleStreamingQuery = async (userMessage: string, convId: string) => {
  try {
    // Configure request for EventSource
    const params = new URLSearchParams({
      conversationId: convId,
      usermessage: userMessage
    });
    
    const eventSource = new EventSource(
      `http://localhost:5000/api/ai/query-data?${params}`
    );
    
    let assistantMessage = '';
    let updatedResponseData: any = null;
    
    // Remove pending message and create streaming message
    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.pending);
      return [...filtered, { role: 'assistant' as const, content: '', pending: true }];
    });
    
    // Handle different event types
    eventSource.addEventListener('status', (event) => {
      const data = JSON.parse(event.data);
      console.log('Status update:', data.message);
    });
    
    eventSource.addEventListener('chunk', (event) => {
      const data = JSON.parse(event.data);
      assistantMessage += data.content;
      
      // Update the streaming message
      setMessages(prev => {
        const lastIndex = prev.length - 1;
        const updatedMessages = [...prev];
        updatedMessages[lastIndex] = { 
          ...updatedMessages[lastIndex], 
          content: assistantMessage,
          pending: true 
        };
        return updatedMessages;
      });
    });
    
    eventSource.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data);
      assistantMessage = data.message;
      updatedResponseData = data.updatedData;
      
      // Finalize the message
      setMessages(prev => {
        const lastIndex = prev.length - 1;
        const updatedMessages = [...prev];
        updatedMessages[lastIndex] = { 
          role: 'assistant',
          content: assistantMessage,
          pending: false
        };
        return updatedMessages;
      });
      
      // Update grid data if there are changes
      if (updatedResponseData) {
        // Convert any date strings back to Date objects before updating the grid
        const convertedData = updatedResponseData.map((row: any) => {
          const newRow = { ...row };

          // Get column definitions to identify date columns
          colDefs.forEach(col => {
            // Check if this is a date column
            const isDateColumn = JSON.stringify(col).includes(JSON.stringify(dateColumn));

            if (isDateColumn) {
              const fieldName = col.title || '';

              // Check if field exists and needs conversion
              if (newRow[fieldName] && typeof newRow[fieldName] === 'string') {
                try {
                  // Convert string to Date object
                  newRow[fieldName] = new Date(newRow[fieldName]);
                } catch (e) {
                  console.error(`Failed to convert date field ${fieldName}:`, e);
                }
              }
            }
          });

          return newRow;
        });

        // Now update with properly typed data
        onDataUpdate(convertedData);
      }
      
      setIsLoading(false);
      eventSource.close();
    });
    
    eventSource.addEventListener('error', (event) => {
      console.error('SSE Error:', event);
      
      // Finalize the message with error
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.pending);
        return [...filtered, { 
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request.',
          pending: false
        }];
      });
      
      setIsLoading(false);
      eventSource.close();
    });
    
    // Handle connection closure
    eventSource.onerror = () => {
      console.error('EventSource connection error');
      
      if (eventSource.readyState === EventSource.CLOSED) {
        setIsLoading(false);
      }
    };
  } catch (error) {
    console.error('Error setting up streaming:', error);
    setIsLoading(false);
    
    // Add error message
    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.pending);
      return [...filtered, { 
        role: 'assistant',
        content: 'Error connecting to the analysis service.',
        pending: false
      }];
    });
  }
};

// Helper to process query responses
const handleQueryResponse = (response: any) => {
  // Remove pending message
  setMessages(prev => prev.filter(msg => !msg.pending));

  // Add assistant response
  setMessages(prev => [
    ...prev,
    { role: 'assistant', content: response.data.message }
  ]);

  // Update grid data if there are changes
  if (response.data.updatedData) {
    // Convert any date strings back to Date objects before updating the grid
    const convertedData = response.data.updatedData.map((row: any) => {
      const newRow = { ...row };

      // Get column definitions to identify date columns
      colDefs.forEach(col => {
        // Check if this is a date column
        const isDateColumn = JSON.stringify(col).includes(JSON.stringify(dateColumn));

        if (isDateColumn) {
          const fieldName = col.title || '';

          // Check if field exists and needs conversion
          if (newRow[fieldName] && typeof newRow[fieldName] === 'string') {
            try {
              // Convert string to Date object
              newRow[fieldName] = new Date(newRow[fieldName]);
            } catch (e) {
              console.error(`Failed to convert date field ${fieldName}:`, e);
            }
          }
        }
      });

      return newRow;
    });

    // Now update with properly typed data
    onDataUpdate(convertedData);
  }
};

  return (
    <div className="flex flex-col h-full border-r border-gray-200">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-gray-800">Data Assistant</h3>
        <p className="text-xs text-gray-500">Ask questions about your data or request modifications</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 bg-white">
        {messages.map((message, index) => (
          message.role !== 'system' ? (
            <div
              key={index}
              className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div className={`inline-block px-3 py-2 rounded-lg max-w-[85%] ${message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
                } ${message.pending ? 'opacity-70' : ''}`}>
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <div className="markdown-content">
                    {message.pending ? (
                      message.content
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={index} className="mb-4 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
              <div className="flex items-start">
                <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="Ask about your data..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`px-3 py-2 rounded-r-lg ${isLoading || !inputMessage.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileDataChatBox;