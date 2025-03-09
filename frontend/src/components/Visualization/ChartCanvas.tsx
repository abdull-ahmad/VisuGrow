import React from 'react';
import html2canvas from 'html2canvas';
import { ChartCanvasProps } from '../../types/visualization';
import { ArrowDownToLine } from 'lucide-react';
import { SingleChart } from './SingleChart';
import GridLayout from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { motion } from 'framer-motion';

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  canvases,
  selectedCanvasId,
  onLayoutChange,
  
  onRemoveChart,
  onSelectChart
}) => {
  const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
    onLayoutChange(selectedCanvasId, newLayout);
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
        
        const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
        const link = document.createElement('a');
        link.download = `canvas-${canvasId}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
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
                </GridLayout>
              </motion.div>
            ))}
        </div>
      </div>      
    </div>
  );
}