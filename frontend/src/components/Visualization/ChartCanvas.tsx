import React from 'react';
import html2canvas from 'html2canvas';
import { ChartCanvasProps} from '../../types/Chart';
import { ArrowDownToLine, CircleFadingPlus, Trash } from 'lucide-react';
import { SingleChart } from './SingleChart';
import GridLayout from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  canvases,
  selectedCanvasId,
  onLayoutChange,
  onCanvasSelect,
  onDeleteCanvas,
  onAddCanvas,
  onRemoveChart,
  onSelectChart
}) => {

  const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
    onLayoutChange(selectedCanvasId, newLayout); // Call parent handler
  };

  const handleDownloadChart = async (chartId: string) => {
    console.log(chartId);
    const element = document.getElementById(`chart-${chartId}`);
    if (element) {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `chart-${chartId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleDownloadCanvas = async (canvasId: string) => {
    console.log("Downloading canvas with ID:", canvasId);
    const element = document.getElementById(`canvas-${canvasId}`);
    if (element) {
      const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
      const link = document.createElement('a');
      link.download = `canvas-${canvasId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else {
      console.error("Canvas element not found:", canvasId);
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          {canvases
            .filter(canvas => canvas.id === selectedCanvasId)
            .map(canvas => (
              <div key={canvas.id} id={`canvas-${canvas.id}`}
                className="custom-scrollbar bg-white shadow-sm rounded-lg"
                style={{
                  width: 'full',
                  height: 'calc(100vh - 11.5rem)',
                  overflow: 'auto'
                }}
              >
                <GridLayout
                  className="layout bg-white"
                  layout={canvas.layout}
                  cols={12}
                  rowHeight={30}
                  width={1200}
                  onLayoutChange={handleLayoutChange}
                  draggableHandle=".drag-handle"
                  isResizable={true}
                  isDraggable={true}
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
                      <div className="drag-handle" style={{
                        position: 'absolute',
                        top: 5,
                        left: 5,
                        cursor: 'move',
                        padding: '2px 5px',
                        borderRadius: 3
                      }}> ⠿
                      </div>
                    </div>
                  ))}
                </GridLayout>
              </div>
            ))}
        </div>
      </div>

      <div className="flex flex-row w-full items-center gap-4 p-4 border-b fixed bottom-0">
        <button
          onClick={onAddCanvas}
          className="px-4 py-2 customColorButton text-white rounded-md"
        >
          <CircleFadingPlus/>
        </button>
        <div className="flex gap-2 overflow-auto">
          {canvases.map(canvas => (
            <button
              key={canvas.id}
              onClick={() => onCanvasSelect(canvas.id)}
              className={`px-2 py-1 text-white font-poppins rounded-md ${canvas.id === selectedCanvasId
                ? 'customColorButton'
                : 'bg-custom hover:bg-gray-300'
                }`}
            >
              {canvas.name}
              <div className="ml-2 inline-flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadCanvas(canvas.id);
                  }}
                  className="text-xs hover:text-blue-600"
                >
                  <ArrowDownToLine />
                </button>
                {canvases.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCanvas(canvas.id);
                    }}
                    className="text-sm hover:text-red-600"
                  >
                    <Trash />
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}