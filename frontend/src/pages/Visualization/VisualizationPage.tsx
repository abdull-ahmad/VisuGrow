import { useState } from 'react';
import Sidebar from '../../components/SideBar';
import { useAuthStore } from '../../store/authStore';
import { ChartCanvas } from '../../components/Visualization/ChartCanvas';
import { FilePanel } from '../../components/Visualization/FilePanel';
import { VisualizationPanel } from '../../components/Visualization/VisualizationPanel';
import GridLayout from 'react-grid-layout';
import { CanvasConfig, ChartConfig } from '../../types/Chart';



const VisualizationPage = () => {
  const { logout } = useAuthStore();
  const [canvases, setCanvases] = useState<CanvasConfig[]>([{
    id: 'default',
    name: 'Canvas',
    charts: [],
    layout: [] // Initialize empty layout
  }]);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string>('default');
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

  const handleLayoutChange = (canvasId: string, newLayout: GridLayout.Layout[]) => {
    setCanvases(prev => prev.map(canvas =>
      canvas.id === canvasId
        ? { ...canvas, layout: newLayout }
        : canvas
    ));
  };

  // Canvas operations
  const addCanvas = () => {
    const newCanvas: CanvasConfig = {
      id: Date.now().toString(),
      name: `Canvas`,
      charts: [],
      layout: [] // Initialize empty layout
    };
    setCanvases(prev => [...prev, newCanvas]);
  };

  const deleteCanvas = (canvasId: string) => {
    if (canvases.length <= 1) return; // Prevent deleting last canvas
    setCanvases(prev => prev.filter(c => c.id !== canvasId));
    if (selectedCanvasId === canvasId) {
      setSelectedCanvasId(canvases[0].id); // Switch to first canvas
    }
  };

  // Chart operations
  const addChart = (chart: ChartConfig) => {
    setCanvases(prev => prev.map(canvas =>
      canvas.id === selectedCanvasId
        ? { ...canvas, charts: [...canvas.charts, chart] }
        : canvas
    ));
    setSelectedChartId(chart.id);
  };

  const updateChart = (id: string, updatedChart: Partial<ChartConfig>) => {
    setCanvases(prev => prev.map(canvas =>
      canvas.id === selectedCanvasId
        ? {
          ...canvas,
          charts: canvas.charts.map(chart =>
            chart.id === id ? { ...chart, ...updatedChart } : chart
          )
        }
        : canvas
    ));
  };

  const removeChart = (id: string) => {
    console.log('remove chart', id);
    setCanvases(prev => prev.map(canvas =>
      canvas.id === selectedCanvasId
        ? {
          ...canvas,
          charts: canvas.charts.filter(chart => chart.id !== id),
          layout: canvas.layout?.filter(l => l.i !== id) || []
        }
        : canvas
    ));
  };

  const selectedCanvas = canvases.find(c => c.id === selectedCanvasId);

  return (
    <div className="flex flex-row min-h-screen">
      <Sidebar isLoading={false} error={null} handleLogout={() => logout()} />
      <div className="flex flex-col w-full min-h-screen overflow-hidden mainCenter">
      <h1 className='text-5xl font-rowdies text-center py-7'> Visualization </h1>
        <div className="flex flex-col flex-1 p-4 space-y-4">
          <div className="flex-1 relative overflow-hidden">
            <ChartCanvas
              canvases={canvases}
              selectedCanvasId={selectedCanvasId}
              onCanvasSelect={setSelectedCanvasId}
              onAddCanvas={addCanvas}
              onLayoutChange={handleLayoutChange}
              onRemoveChart={removeChart}
              onDeleteCanvas={deleteCanvas}
              onSelectChart={setSelectedChartId} // Pass the setSelectedChartId function
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col w-1/5 border-l-2 border-gray-200 p-4 space-y-4 sidebar">
      <FilePanel />
      <div className="flex-1 overflow-hidden">
        {selectedCanvas && (
          <VisualizationPanel
            charts={selectedCanvas.charts}
            addChart={addChart}
            updateChart={updateChart}
            selectedChartId={selectedChartId}
            setSelectedChartId={setSelectedChartId}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;