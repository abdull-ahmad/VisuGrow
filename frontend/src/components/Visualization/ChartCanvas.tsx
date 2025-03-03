import React from 'react';
import Bar from '../Charts/Bar';
import Line from '../Charts/Line';
import { useDataStore } from '../../store/dataStore';
import { ChartCanvasProps, ChartConfig } from '../../types/Chart';
import html2canvas from 'html2canvas';
import  GridLayout from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

const SingleChart: React.FC<{
  chart: ChartConfig;
  onDownload: () => void;
  onSelect: () => void;
  onDelete: () => void;

}> = ({ chart, onDownload, onSelect, onDelete }) => {

  const { fileData } = useDataStore();

  const chartData = React.useMemo(() => {
    if (!fileData || !chart.xParameter || !chart.yParameter) return [];
    return [
      {
        label: `${chart.yParameter} vs ${chart.xParameter}`,
        data: fileData.map((item: any) => ({
          primary: item[chart.xParameter],
          secondary: item[chart.yParameter],
        })),
      },
    ];
  }, [fileData, chart.xParameter, chart.yParameter]);

  let content;
  if (!fileData || fileData.length === 0) {
    content = <div className="text-gray-500 p-4">No data available</div>;
  } else if (!chart.chartType) {
    content = <div className="text-gray-500 p-4">Select a chart type to begin</div>;
  } else if (!chart.xParameter || !chart.yParameter) {
    content = <div className="text-gray-500 p-4">Select both X and Y parameters</div>;
  } else {
    switch (chart.chartType) {
      case 'bar':
        content = <div className='h-full w-full'> <Bar chartData={chartData} xLabel={chart.xParameter} yLabel={chart.yParameter} /> </div>;
        break;
      case 'line':
        content = <div className='h-full w-full'><Line chartData={chartData} xLabel={chart.xParameter} yLabel={chart.yParameter} /> </div>;
        break;
      // Add cases for 'line' and 'area' when components are available
      default:
        content = <div>Unsupported chart type</div>;
    }
  }

  return (
    <div className="relative h-full w-full p-4 border rounded-lg overflow-hidden" 
    id={`chart-${chart.id}`}
    onClick={onSelect}
    >
      <div className="absolute top-1 right-1 flex gap-1">
        <button
          onClick={onDownload}
          className="p-1 bg-white rounded "
          title="Download Chart"
        >
          ⬇️
        </button>
        <button
          onClick={onDelete}
          className="p-1 bg-white rounded text-red-500"
          title="Delete Chart"
        >
          🗑️
        </button>
      </div>
      {content}
    </div>
  );
};

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
    <div className="w-full h-full overflow-hidden">
      <div className="flex items-center gap-4 p-4 border-b">
        <button
          onClick={onAddCanvas}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Canvas
        </button>
        <div className="flex gap-2 overflow-auto">
          {canvases.map(canvas => (
            <button
              key={canvas.id}
              onClick={() => onCanvasSelect(canvas.id)}
              className={`px-4 py-2 rounded-md min-w-[100px] ${canvas.id === selectedCanvasId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
                }`}
            >
              {canvas.name}
              <div className="ml-2 inline-flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadCanvas(canvas.id);
                  }}
                  className="text-sm hover:text-blue-600"
                >
                  ⬇️
                </button>
                {canvases.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCanvas(canvas.id);
                    }}
                    className="text-sm hover:text-red-600"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-full overflow-hidden">
        {canvases
          .filter(canvas => canvas.id === selectedCanvasId)
          .map(canvas => (
            <div key={canvas.id} id={`canvas-${canvas.id}`} className="h-full">
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
                snapToGrid={true} // Enable snap-to-grid
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
                      background: 'rgba(0,0,0,0.1)',
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
  );
}