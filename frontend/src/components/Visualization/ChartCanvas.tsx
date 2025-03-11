import React from 'react';
import html2canvas from 'html2canvas';
import { ChartCanvasProps } from '../../types/visualization';
import { ArrowDownToLine, Type } from 'lucide-react';
import { SingleChart } from './SingleChart';
import GridLayout from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { motion } from 'framer-motion';
import { TextBox } from '../TextBox';
import { TextBoxItem } from '../../types/visualization';
import { v4 as uuidv4 } from 'uuid'; 

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  canvases,
  selectedCanvasId,
  onLayoutChange,
  onRemoveChart,
  onSelectChart,
  onAddTextBox,
  onUpdateTextBox,
  onRemoveTextBox

}) => {
  const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
    onLayoutChange(selectedCanvasId, newLayout);
  };

  const handleAddTextBox = () => {
    if (typeof onAddTextBox === 'function') {
      const newTextBox: TextBoxItem = {
        id: uuidv4(),
        type: 'textbox',
        content: ''
      };
      console.log('Adding new text box:', newTextBox);
      onAddTextBox(selectedCanvasId, newTextBox);
    } else {
      console.error('onAddTextBox function is not provided');
    }
  };

  // Handle text box content changes
  const handleTextBoxContentChange = (textBoxId: string, content: string) => {
    if (typeof onUpdateTextBox === 'function') {
      onUpdateTextBox(selectedCanvasId, textBoxId, { content });
    } else {
      console.error('onUpdateTextBox function is not provided');
    }
  };

  // Handle text box deletion
  const handleRemoveTextBox = (textBoxId: string) => {
    if (typeof onRemoveTextBox === 'function') {
      onRemoveTextBox(selectedCanvasId, textBoxId);
    } else {
      console.error('onRemoveTextBox function is not provided');
    }
  };

  const handleDownloadChart = async (chartId: string) => {
    const element = document.getElementById(`chart-${chartId}`);
    if (element) {
      const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
      const link = document.createElement('a');
      link.download = `chart-${chartId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleDownloadCanvas = async (canvasId: string) => {
    const element = document.getElementById(`canvas-${canvasId}`);
    if (element) {
      try {
        // Show loading indicator
        const loadingEl = document.createElement('div');
        loadingEl.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
        loadingEl.innerHTML = '<div class="bg-white p-4 rounded-lg shadow-lg">Generating image...</div>';
        document.body.appendChild(loadingEl);
        
        // Get the original scroll positions
        const containerEl = element.parentElement;
        const originalScrollTop = containerEl?.scrollTop || 0;
        const originalScrollLeft = containerEl?.scrollLeft || 0;
        
        // Set options to capture full content
        const options = {
          useCORS: true,
          scale: 2,
          scrollX: 0,
          scrollY: 0,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          width: element.scrollWidth,
          height: element.scrollHeight,
          onclone: (clonedDoc: Document) => {
            // Find the cloned element
            const clonedElement = clonedDoc.getElementById(`canvas-${canvasId}`);
            if (clonedElement) {
              // Ensure cloned element and its containers have full dimensions visible
              clonedElement.style.overflow = 'visible';
              if (clonedElement.parentElement) {
                clonedElement.parentElement.style.overflow = 'visible';
                clonedElement.parentElement.style.height = 'auto';
              }
            }
          }
        };
        
        const canvas = await html2canvas(element, options);
        
        // Create and trigger download
        const link = document.createElement('a');
        link.download = `canvas-${canvasId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Restore scroll positions
        if (containerEl) {
          containerEl.scrollTop = originalScrollTop;
          containerEl.scrollLeft = originalScrollLeft;
        }
        
        // Remove loading indicator
        document.body.removeChild(loadingEl);
      } catch (error) {
        console.error("Error generating canvas image:", error);
      }
    } else {
      console.error("Canvas element not found:", canvasId);
    }
  };

  const selectedCanvas = canvases.find(canvas => canvas.id === selectedCanvasId);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header with current canvas name */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-poppins text-gray-800">
          {selectedCanvas?.name || 'Canvas'}
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAddTextBox}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Type size={16} /> Add Text
          </button>
          <button 
            onClick={() => handleDownloadCanvas(selectedCanvasId)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowDownToLine size={16} /> Export
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          {canvases
            .filter(canvas => canvas.id === selectedCanvasId)
            .map(canvas => (
              <motion.div 
                key={canvas.id} 
                id={`canvas-${canvas.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white shadow-sm rounded-lg mx-6 my-4"
                style={{
                  height: '65vh',
                  overflow: 'auto'
                }}
              >
                <GridLayout
                  className="layout"
                  layout={canvas.layout}
                  cols={12}
                  rowHeight={30}
                  width={1200}
                  onLayoutChange={handleLayoutChange}
                  draggableHandle=".drag-handle"
                  isResizable={true}
                  isDraggable={true}
                  margin={[16, 16]}
                >
                  {/* Render charts */}
                  {canvas.charts.map(chart => (
                    <div
                      key={chart.id}
                      data-grid={(canvas.layout && canvas.layout.find(l => l.i === chart.id)) || {
                        x: 0, y: 0, w: 4, h: 6
                      }}
                    >
                      <SingleChart
                        key={chart.id}
                        chart={chart}
                        onSelect={() => onSelectChart(chart.id)}
                        onDelete={() => onRemoveChart(chart.id)}
                        onDownload={() => handleDownloadChart(chart.id)}
                      />
                    </div>
                  ))}
                  
                  {/* Render text boxes */}
                  {canvas.textBoxes && canvas.textBoxes.map(textBox => (
                    <div
                      key={textBox.id}
                      data-grid={(canvas.layout && canvas.layout.find(l => l.i === textBox.id)) || {
                        x: 0, y: 0, w: 4, h: 6
                      }}
                    >
                      <TextBox
                        id={textBox.id}
                        content={textBox.content}
                        onDelete={() => handleRemoveTextBox(textBox.id)}
                        onContentChange={(content) => handleTextBoxContentChange(textBox.id, content)}
                      />
                    </div>
                  ))}
                </GridLayout>
              </motion.div>
            ))}
        </div>
      </div>      
    </div>
  );
}