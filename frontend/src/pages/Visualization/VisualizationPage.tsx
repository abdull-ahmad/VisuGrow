import { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import { useAuthStore } from '../../store/authStore';
import { ChartCanvas } from '../../components/Visualization/ChartCanvas';
import { FilePanel } from '../../components/Visualization/FilePanel';
import { VisualizationPanel } from '../../components/Visualization/VisualizationPanel';
import GridLayout from 'react-grid-layout';
import { CanvasConfig, ChartConfig } from '../../types/Chart';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  PanelRight, 
  PanelLeft,
  Layers,
  BarChart3,
  Database,
  ChevronDown,
  Trash2,
  Check
} from 'lucide-react';
import '../../index.css';

const VisualizationPage = () => {
  const { logout } = useAuthStore();
  const [canvases, setCanvases] = useState<CanvasConfig[]>([{
    id: 'default',
    name: 'Main Canvas',
    charts: [],
    layout: [] // Initialize empty layout
  }]);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string>('default');
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'data' | 'visualize'>('data');
  

  const handleLayoutChange = (canvasId: string, newLayout: GridLayout.Layout[]) => {
    setCanvases(prev => prev.map(canvas =>
      canvas.id === canvasId
        ? { ...canvas, layout: newLayout }
        : canvas
    ));
  };
  const [showCanvasSelector, setShowCanvasSelector] = useState(false);

  // Canvas operations
  const addCanvas = () => {
    const newCanvas: CanvasConfig = {
      id: Date.now().toString(),
      name: `Canvas ${canvases.length + 1}`,
      charts: [],
      layout: [] 
    };
    setCanvases(prev => [...prev, newCanvas]);
    setSelectedCanvasId(newCanvas.id);
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
    setCanvases(prev => prev.map(canvas =>
      canvas.id === selectedCanvasId
        ? {
          ...canvas,
          charts: canvas.charts.filter(chart => chart.id !== id),
          layout: canvas.layout?.filter(l => l.i !== id) || []
        }
        : canvas
    ));

    if (selectedChartId === id) {
      setSelectedChartId(null);
    }
  };

  const selectedCanvas = canvases.find(c => c.id === selectedCanvasId);
  
  // Auto-expand panel when a chart is selected
  useEffect(() => {
    if (selectedChartId && rightPanelCollapsed) {
      setRightPanelCollapsed(false);
    }
  }, [selectedChartId]);

  return (
    <div className="flex flex-row h-screen bg-[#4a8cbb1b] overflow-hidden">
      <Sidebar isLoading={false} error={null} handleLogout={() => logout()} />
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header Section */}
        <header className="bg-[#4a8cbb1b] shadow-sm px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-rowdies text-gray-800">Visualization Studio</h1>
              <p className="text-gray-500 mt-1 font-poppins">Create and customize interactive data visualizations</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                className={`p-2 rounded-md ${!rightPanelCollapsed ? 'bg-[#053252] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
                title={rightPanelCollapsed ? "Open Panel" : "Close Panel"}
              >
                {rightPanelCollapsed ? <PanelLeft size={18} /> : <PanelRight size={18} />}
              </button>
            </div>
          </div>
        </header>
        
        {/* Canvas Section */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative">
            <motion.div 
              className="absolute inset-0 flex flex-col"
              transition={{ duration: 0.3 }}
            >
              {/* Canvas Title and Controls */}
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
                {/* Canvas Selector with Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowCanvasSelector(!showCanvasSelector)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Layers size={18} className="text-gray-500" />
                    <h2 className="font-poppins text-gray-800">
                      {selectedCanvas?.name || 'Canvas'}
                    </h2>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>
                  
                  {/* Canvas Selector Dropdown */}
                  {showCanvasSelector && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1 max-h-64 overflow-y-auto">
                        {canvases.map(canvas => (
                          <div 
                            key={canvas.id}
                            className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                              selectedCanvasId === canvas.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div 
                              className="flex-1"
                              onClick={() => {
                                setSelectedCanvasId(canvas.id);
                                setShowCanvasSelector(false);
                              }}
                            >
                              <span className="font-poppins text-sm">{canvas.name}</span>
                              {selectedCanvasId === canvas.id && (
                                <Check size={14} className="ml-2 inline text-blue-600" />
                              )}
                            </div>
                            {canvases.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this canvas?')) {
                                    deleteCanvas(canvas.id);
                                    setShowCanvasSelector(false);
                                  }
                                }}
                                className="p-1 rounded-md hover:bg-red-50 hover:text-red-500"
                                title="Delete Canvas"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-gray-100 px-4 py-2">
                        <button 
                          onClick={() => {
                            addCanvas();
                            setShowCanvasSelector(false);
                          }}
                          className="flex items-center space-x-1 text-xs font-poppins text-blue-600 hover:text-blue-700"
                        >
                          <PlusCircle size={14} />
                          <span>Create New Canvas</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <ChartCanvas
                  canvases={canvases}
                  selectedCanvasId={selectedCanvasId}
                  onCanvasSelect={setSelectedCanvasId}
                  onAddCanvas={addCanvas}
                  onLayoutChange={handleLayoutChange}
                  onRemoveChart={removeChart}
                  onDeleteCanvas={deleteCanvas}
                  onSelectChart={setSelectedChartId}
                />
              </div>
            </motion.div>
          </div>
          
          {/* Right Panel - Data & Visualization Controls */}
          <AnimatePresence>
            {!rightPanelCollapsed && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-80 border-l border-gray-200 bg-white shadow-lg flex-shrink-0"
              >
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveRightTab('data')}
                    className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-poppins relative ${
                      activeRightTab === 'data' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Database size={16} className="mr-2" />
                    Data Sources
                    
                    {activeRightTab === 'data' && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        layoutId="tabIndicator"
                      />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveRightTab('visualize')}
                    className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-poppins relative ${
                      activeRightTab === 'visualize' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BarChart3 size={16} className="mr-2" />
                    Visualize
                    
                    {activeRightTab === 'visualize' && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        layoutId="tabIndicator"
                      />
                    )}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  {activeRightTab === 'data' && (
                    <div className="p-4">
                      <FilePanel />
                    </div>
                  )}
                  
                  {activeRightTab === 'visualize' && selectedCanvas && (
                    <div className="p-4">
                      <VisualizationPanel
                        charts={selectedCanvas.charts}
                        addChart={addChart}
                        updateChart={updateChart}
                        onRemoveChart={removeChart}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;