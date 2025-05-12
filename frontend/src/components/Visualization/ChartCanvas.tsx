import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { motion } from 'framer-motion'; // Assuming default import
import html2canvas from 'html2canvas';
import { Type, ArrowDownToLine, Inbox } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';
import { useDataSourceStore } from '../../store/dataSourceStore'; // Import
import { SingleChart } from './SingleChart';
import { TextBox } from '../TextBox';
import { ChartCanvasProps, TextBoxItem } from '../../types/visualization';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisModal } from '../Modal/AnalysisModal';

export const ChartCanvas: React.FC<ChartCanvasProps> = () => {
  const {
    canvases,
    selectedCanvasId,
    handleLayoutChange: onLayoutChange, // Use store action
    removeChart: onRemoveChart,         // Use store action
    setSelectedChartId: onSelectChart,  // Use store action
    addTextBox: addTextBoxToCanvas,
    updateTextBox: updateTextBoxInCanvas,
    removeTextBox: removeTextBoxFromCanvas,
  } = useVisualizationStore();

  const handleAddTextBoxWithContent = (content: string) => {
    if (!selectedCanvasId) return;
    const newTextBox: TextBoxItem = { id: uuidv4(), type: 'textbox', content };
    addTextBoxToCanvas(selectedCanvasId, newTextBox);
  };

  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<{ text: string; title: string } | null>(null);

  const handleOpenAnalysisModal = (text: string, title: string) => {
    setAnalysisData({ text, title });
    setIsAnalysisModalOpen(true);
  };

  const handleCloseAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setAnalysisData(null);
  };

  // Get data status from dataSourceStore
  const { sourceData, isSourceLoading } = useDataSourceStore();

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
        const options = {
          useCORS: true,
          scale: 2,
          scrollX: 0,
          scrollY: 0,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          width: element.scrollWidth,
          height: element.scrollHeight,
        };

        const canvas = await html2canvas(element, options);

        const link = document.createElement('a');
        link.download = `canvas-${canvasId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error generating canvas image:', error);
      }
    } else {
      console.error('Canvas element not found:', canvasId);
    }
  };


  const selectedCanvas = canvases.find(canvas => canvas.id === selectedCanvasId);

  // --- Handlers ---
  // addTextBox, updateTextBox, removeTextBox call store actions directly
  const handleAddTextBox = () => { /* ... calls addTextBoxToCanvas ... */
    if (!selectedCanvasId) return;
    const newTextBox: TextBoxItem = { id: uuidv4(), type: 'textbox', content: 'New Text' };
    addTextBoxToCanvas(selectedCanvasId, newTextBox);
  };
  const handleUpdateTextBox = (textBoxId: string, content: string) => { /* ... calls updateTextBoxInCanvas ... */
    if (!selectedCanvasId) return;
    updateTextBoxInCanvas(selectedCanvasId, textBoxId, { content });
  };
  const handleRemoveTextBox = (textBoxId: string) => { /* ... calls removeTextBoxFromCanvas ... */
    if (!selectedCanvasId) return;
    removeTextBoxFromCanvas(selectedCanvasId, textBoxId);
  };

  // --- Render Logic ---
  if (!selectedCanvas) {
    return <div className="p-4 text-center text-gray-500">Canvas not found.</div>;
  }

  const layout = selectedCanvas.layout || [];
  const chartsAndTextBoxes = [
    ...(selectedCanvas.charts || []),
    ...(selectedCanvas.textBoxes || [])
  ];

  // Generate default layout if needed
  const currentLayout = chartsAndTextBoxes.map((item, index) => {
    return layout.find(l => l.i === item.id) || {
      i: item.id, x: (index * 4) % 12, y: Math.floor((index * 4) / 12) * 6,
      w: 4, h: item.type === 'textbox' ? 3 : 6, // Default size
      isResizable: true, isDraggable: true,
    };
  });

  const isCanvasEmpty = chartsAndTextBoxes.length === 0;
  const isDataLoaded = sourceData && sourceData.length > 0 && !isSourceLoading;

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between flex-shrink-0">
        {/* ... (header content: title, buttons) ... */}
        <h1 className="text-lg font-semibold text-gray-800 truncate pr-4"> {selectedCanvas.name} </h1>
        <div className="flex items-center gap-3">
          <button onClick={handleAddTextBox} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md transition-colors text-gray-700 hover:bg-gray-50 hover:border-gray-400`} > <Type size={16} /> Add Text </button>
          <button onClick={() => handleDownloadCanvas(selectedCanvasId)} disabled={isCanvasEmpty} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md transition-colors ${isCanvasEmpty ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 hover:border-gray-400'}`} > <ArrowDownToLine size={16} /> Export Canvas </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-grow relative overflow-auto p-4">
        {/* Placeholder: Canvas is empty AND no data loaded */}
        {isCanvasEmpty && !isDataLoaded && !isSourceLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="text-center p-6 bg-white/70 rounded-lg shadow border border-gray-200 backdrop-blur-sm">
              <Inbox size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium">Canvas is empty</p>
              <p className="text-sm text-gray-400 mt-1">Load data and add charts, or add text boxes.</p>
            </div>
          </div>
        )}
        {/* Placeholder: Canvas is empty BUT data IS loaded */}
        {isCanvasEmpty && isDataLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="text-center p-6 bg-white/70 rounded-lg shadow border border-gray-200 backdrop-blur-sm">
              <Inbox size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium">Canvas is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add charts from the builder panel or add text boxes.</p>
            </div>
          </div>
        )}

        {isAnalysisModalOpen && analysisData && (
          <AnalysisModal
            isOpen={isAnalysisModalOpen}
            isLoading={false} // Adjust based on your loading state
            analysisText={analysisData.text}
            chartTitle={analysisData.title}
            onClose={handleCloseAnalysisModal}
            onPersistAnalysis={(text: any) => {
              handleAddTextBoxWithContent(text);
              handleCloseAnalysisModal();
            }}
          />
        )}


        {/* Render grid only if there are items */}
        {!isCanvasEmpty && (
          <motion.div
            key={selectedCanvasId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-full relative z-10" // Ensure grid is above placeholders
            id={`canvas-${selectedCanvasId}`}
          >
            <GridLayout
              className="layout"
              layout={currentLayout}
              cols={12}
              rowHeight={30}
              width={1200} // Consider making this dynamic
              onLayoutChange={(newLayout) => onLayoutChange(selectedCanvasId, newLayout)}
              draggableHandle=".drag-handle"
              isResizable={true}
              isDraggable={true}
              margin={[15, 15]}
              containerPadding={[0, 0]}
              useCSSTransforms={false}
              compactType="vertical"
            >
              {/* Render charts */}
              {(selectedCanvas.charts || []).map(chart => (
                <div key={chart.id} className="overflow-hidden rounded-lg" >
                  <SingleChart
                    chart={chart}
                    onSelect={() => onSelectChart(chart.id)}
                    onDelete={() => onRemoveChart(chart.id)}
                    onDownload={() => handleDownloadChart(chart.id)}
                    onAddTextBoxWithContent={handleAddTextBoxWithContent}
                    isDraggable={true}
                    onAnalyze={(text, title) => handleOpenAnalysisModal(text, title)}
                  />
                </div>
              ))}

              {/* Render text boxes */}
              {(selectedCanvas.textBoxes || []).map(textBox => (
                <div key={textBox.id} className="overflow-hidden rounded-lg" >
                  <TextBox
                    id={textBox.id}
                    content={textBox.content}
                    onDelete={() => handleRemoveTextBox(textBox.id)}
                    onContentChange={(content) => handleUpdateTextBox(textBox.id, content)}
                  // Assuming TextBox supports this
                  />
                </div>
              ))}
            </GridLayout>
          </motion.div>
        )}
      </div>
    </div>
  );
}