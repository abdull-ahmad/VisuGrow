import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, GripHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface TextBoxProps {
  id: string;
  content: string;
  onDelete: () => void;
  onContentChange: (content: string) => void;
}

export const TextBox: React.FC<TextBoxProps> = ({ id, content, onDelete, onContentChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);
  const [isHovered, setIsHovered] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    onContentChange(text);
    setIsEditing(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    setIsEditing(!isEditing);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    onDelete();
  };

  return (
    <motion.div
      className="h-full w-full overflow-hidden bg-white rounded-xl border border-gray-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      id={`textbox-${id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
    >
      {/* Text Box Header - Only this part should be draggable */}
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between drag-handle">
        <div className="flex items-center">
          <GripHorizontal className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">Text Note</span>
        </div>

        <motion.div
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={handleEdit}
            className="p-1 hover:bg-gray-100 rounded-md"
            onMouseDown={(e) => e.stopPropagation()} // Important for drag prevention
          >
            <Pencil size={16} className="text-gray-500" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-gray-100 rounded-md"
            onMouseDown={(e) => e.stopPropagation()} // Important for drag prevention
          >
            <Trash2 size={16} className="text-gray-500" />
          </button>
        </motion.div>
      </div>

      {/* Text Box Content - Not draggable */}
      <div className="p-4 h-[calc(100%-48px)] overflow-auto">
        {isEditing ? (
          <div className="h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Enter your notes here..."
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600"
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="prose prose-sm max-w-none h-full overflow-auto" 
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {text || <span className="text-gray-400 italic">Click to add text</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
};