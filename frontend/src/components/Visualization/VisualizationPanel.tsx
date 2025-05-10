import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, X, BarChart3, LineChart, AreaChart, PieChart, Radar, Radiation, Cone, ChevronLeft, ChevronRight, Database, Palette, Filter, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';
import { useDataSourceStore } from '../../store/dataSourceStore'; // Import data source store
import { ChartConfig } from '../../types/visualization';

const COLOR_PRESETS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6'
];

// Helper components (ParameterOption, SelectInput - assuming they exist or are defined as in previous thoughts)
// ... (Include ParameterOption and SelectInput helper components here if not imported) ...
const ParameterOption: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value} className="text-gray-800">{children}</option>
);

const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { name: string; type: string }[] | null;
  placeholder: string;
  disabled?: boolean;
  filterType?: 'numeric' | 'date' | 'all'; // Optional filter
}> = ({ label, value, onChange, options, placeholder, disabled = false, filterType = 'all' }) => {
  const filteredOptions = React.useMemo(() => {
    if (!options) return [];
    if (filterType === 'numeric') {
      return options.filter(h => ['number', 'integer', 'float', 'decimal'].includes(h.type?.toLowerCase()));
    }
    if (filterType === 'date') {
       return options.filter(h => ['date', 'datetime', 'timestamp'].includes(h.type?.toLowerCase()));
    }
    return options;
  }, [options, filterType]);

  const hasOptions = filteredOptions.length > 0;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={!hasOptions || disabled}
        className={`w-full px-3 py-2 bg-white border ${!hasOptions || disabled ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50'} rounded-md shadow-sm text-sm transition duration-150 ease-in-out`}
      >
        <ParameterOption value="">{hasOptions ? placeholder : `No ${filterType !== 'all' ? filterType : ''} fields available`}</ParameterOption>
        {filteredOptions.map((header) => (
          <ParameterOption key={header.name} value={header.name}>
            {header.name} <span className="text-gray-400 text-xs">({header.type})</span>
          </ParameterOption>
        ))}
      </select>
    </div>
  );
};


export const VisualizationPanel: React.FC = () => {
  const {
    canvases,
    selectedCanvasId,
    addChart: addChartToCanvas,
    updateChart: updateChartInCanvas,
    removeChart: removeChartFromCanvas,
    selectedChartId,
    setSelectedChartId,
  } = useVisualizationStore();

  // Use the data source store for headers and data status
  const { sourceHeaders, sourceData, isSourceLoading } = useDataSourceStore();

  const [activeTab, setActiveTab] = useState('data');
  const [expanded, setExpanded] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const currentCanvas = canvases.find(c => c.id === selectedCanvasId);
  const charts = currentCanvas?.charts || [];
  const selectedChart = charts.find((chart) => chart.id === selectedChartId);

  // Auto-select first chart or clear selection
  useEffect(() => {
    if (charts.length > 0 && !charts.some(c => c.id === selectedChartId)) {
      setSelectedChartId(charts[0].id);
    } else if (charts.length === 0) {
      setSelectedChartId(null);
    }
  }, [charts, selectedChartId, setSelectedChartId]);

  // --- Chart Actions ---
  const handleAddChart = () => {
    if (!selectedCanvasId || !sourceData || sourceData.length === 0) return; // Prevent adding if no data
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      chartType: 'bar',
      xParameter: '',
      yParameter: '',
      color: COLOR_PRESETS[charts.length % COLOR_PRESETS.length],
    };
    addChartToCanvas(newChart);
    setSelectedChartId(newChart.id);
    setActiveTab('data'); // Focus data tab for new chart

    // Scroll to new chart tab
    setTimeout(() => {
      chartContainerRef.current?.scrollTo({ left: chartContainerRef.current.scrollWidth, behavior: 'smooth' });
    }, 100);
  };

  const updateChart = (chartId: string, updates: Partial<ChartConfig>) => {
     if (!selectedCanvasId) return;
     updateChartInCanvas(chartId, updates);
  }

  // ... (handlers: handleChartTypeChange, handleXChange, handleYChange, handleColorChange, handleDateFilterChange, handleNumberFilterChange remain the same, calling updateChart) ...
   const handleChartTypeChange = (chartId: string, newType: ChartConfig['chartType']) => {
    updateChart(chartId, { chartType: newType });
  };

  const handleXChange = (chartId: string, newX: string) => {
    updateChart(chartId, { xParameter: newX });
  };

  const handleYChange = (chartId: string, newY: string) => {
    updateChart(chartId, { yParameter: newY });
  };

  const handleColorChange = (chartId: string, newColor: string) => {
    updateChart(chartId, { color: newColor });
  };

  const handleDateFilterChange = (chartId: string, filterType: 'Y' | 'M' | 'W' | 'D' | null) => {
    updateChart(chartId, { dateFilterType: filterType });
  };

  const handleNumberFilterChange = (chartId: string, filterType: 'increasing' | 'decreasing' | null ) => {
    updateChart(chartId, { numberFilterType: filterType });
  };


  const handleDeleteChart = (chartId: string) => {
    if (!selectedCanvasId) return;
    removeChartFromCanvas(chartId);
  };

  // --- Parameter Type Logic ---
  const getParameterType = (paramName: string): string | null => {
    const header = sourceHeaders?.find((h) => h.name === paramName);
    const type = header?.type?.toLowerCase();
    if (type === 'datetime' || type === 'timestamp') return 'date';
    if (type === 'integer' || type === 'float' || type === 'decimal') return 'number';
    return type || null;
  };

  // Determine if filters should be shown based on selected params and chart type
  const showDateFilter = selectedChart && (selectedChart.chartType === 'line' || selectedChart.chartType === 'area') && getParameterType(selectedChart.xParameter) === 'date';
  const showNumberFilter = selectedChart && (getParameterType(selectedChart.yParameter) === 'number'); // Allow sorting for most charts with numeric Y

  // --- UI Helpers ---
  // ... (getChartIcon, scrollCharts, handleScroll, canScrollLeft, canScrollRight remain the same) ...
   const getChartIcon = (type: string | undefined) => {
    switch (type) {
      case 'bar': return <BarChart3 size={18} />; // Adjusted size
      case 'line': return <LineChart size={18} />;
      case 'area': return <AreaChart size={18} />;
      case 'pie': return <PieChart size={18} />;
      case 'radar': return <Radar size={18} />;
      case 'radial': return <Radiation size={18} />;
      case 'funnel': return <Cone size={18} />;
      default: return <BarChart3 size={18} />;
    }
  };

  const scrollCharts = (direction: 'left' | 'right') => {
    if (chartContainerRef.current) {
      const scrollAmount = 150;
      const currentScroll = chartContainerRef.current.scrollLeft;
      const newPosition = direction === 'left'
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      chartContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

   const handleScroll = () => {
     if (chartContainerRef.current) {
       setScrollPosition(chartContainerRef.current.scrollLeft);
     }
  };

  const canScrollLeft = scrollPosition > 5; // Add buffer
  const canScrollRight = chartContainerRef.current
    ? chartContainerRef.current.scrollWidth > chartContainerRef.current.clientWidth + scrollPosition + 5
    : false;


  const isDataReady = sourceData && sourceData.length > 0 && !isSourceLoading;

  // --- Render Logic ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#f8fafc] rounded-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col h-full"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#053252] to-[#1e5a87] px-4 py-3 flex items-center justify-between text-white shadow-sm flex-shrink-0">
        {/* ... (header content remains the same) ... */}
         <h2 className="text-lg font-rowdies flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Chart Builder
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          aria-label={expanded ? "Collapse Panel" : "Expand Panel"}
        >
          {expanded ? <X size={18} /> : <Settings size={18} />}
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-y-auto flex-grow" // Allows content to scroll if it overflows
          >
            <div className="p-4">
              {/* Chart Selection Header & Tabs */}
              <div className="flex flex-col mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-gray-600">
                    {charts.length} {charts.length === 1 ? 'Chart' : 'Charts'} on '{currentCanvas?.name || 'Canvas'}'
                  </div>
                  <motion.button
                    whileHover={{ scale: isDataReady ? 1.05 : 1 }}
                    whileTap={{ scale: isDataReady ? 0.95 : 1 }}
                    onClick={handleAddChart}
                    disabled={!isDataReady} // Disable if no data loaded
                    className={`flex items-center gap-1 px-3 py-1.5 text-white rounded-md text-sm font-medium shadow-sm transition-colors ${
                        !isDataReady ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#053252] hover:bg-[#1e5a87]'
                    }`}
                  >
                    <Plus size={16} /> New Chart
                  </motion.button>
                </div>

                {/* Chart Tabs Scroller */}
                {charts.length > 0 && (
                  <div className="relative flex items-center">
                    {/* ... (Scroll buttons and chart tabs container remain the same) ... */}
                     {canScrollLeft && (
                      <button onClick={() => scrollCharts('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors" aria-label="Scroll charts left"> <ChevronLeft size={18} /> </button>
                    )}
                    <div ref={chartContainerRef} onScroll={handleScroll} className="flex space-x-2 overflow-x-auto scrollbar-hide py-1 px-8">
                      {charts.map((chart, index) => (
                        <button
                          key={chart.id}
                          onClick={() => setSelectedChartId(chart.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors border ${ selectedChartId === chart.id ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300' }`}
                        >
                          {getChartIcon(chart.chartType)}
                          <span className="text-xs">Chart {index + 1}</span>
                          <motion.button whileHover={{ scale: 1.2, color: '#ef4444' }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleDeleteChart(chart.id); }} className="ml-1 text-gray-400 hover:text-red-500" aria-label={`Delete Chart ${index + 1}`} > <Trash2 size={12} /> </motion.button>
                        </button>
                      ))}
                    </div>
                    {canScrollRight && (
                       <button onClick={() => scrollCharts('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors" aria-label="Scroll charts right"> <ChevronRight size={18} /> </button>
                    )}
                  </div>
                )}
              </div>

              {/* Placeholder: No Data Loaded */}
              {!isDataReady && !isSourceLoading && charts.length === 0 && (
                 <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
                    {/* ... (Placeholder content) ... */}
                    <div className="mx-auto bg-white rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-sm border"> <Database className="text-blue-400" size={28} /> </div>
                    <h3 className="text-lg font-medium text-gray-700">Load Data Source</h3>
                    <p className="text-sm text-gray-500 mb-4">Select and load a data source to start building charts.</p>
                 </div>
              )}

              {/* Placeholder: Data Loaded, No Charts */}
               {isDataReady && charts.length === 0 && (
                 <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
                    {/* ... (Placeholder content) ... */}
                    <div className="mx-auto bg-white rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-sm border"> <PieChart className="text-blue-400" size={28} /> </div>
                    <h3 className="text-lg font-medium text-gray-700">No Charts Yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Create your first chart using the loaded data.</p>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddChart} className="inline-flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium text-white shadow-sm bg-[#053252] hover:bg-[#1e5a87]"> <Plus size={18} /> Create Chart </motion.button>
                 </div>
              )}

              {/* Chart Configuration Section */}
              {selectedChart && isDataReady && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Config Tabs (Data, Visualize, Filter) */}
                  <div className="flex border-b border-gray-200 mb-4 bg-gray-50 rounded-t-lg overflow-hidden">
                    {/* ... (Tab buttons remain the same) ... */}
                     <button onClick={() => setActiveTab('data')} className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'data' ? 'bg-white text-[#053252] border-b-2 border-[#053252]' : 'text-gray-500 hover:bg-gray-100'}`}> <Database size={16} /> Data </button>
                     <button onClick={() => setActiveTab('visualize')} className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'visualize' ? 'bg-white text-[#053252] border-b-2 border-[#053252]' : 'text-gray-500 hover:bg-gray-100'}`}> <Palette size={16} /> Visualize </button>
                     <button onClick={() => setActiveTab('filter')} className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'filter' ? 'bg-white text-[#053252] border-b-2 border-[#053252]' : 'text-gray-500 hover:bg-gray-100'}`}> <Filter size={16} /> Filter </button>
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Data Tab */}
                      {activeTab === 'data' && (
                        <div>
                           <SelectInput
                              label="X-Axis Parameter"
                              value={selectedChart.xParameter}
                              onChange={(e) => handleXChange(selectedChart.id, e.target.value)}
                              options={sourceHeaders} // Use headers from dataSourceStore
                              placeholder="Select X parameter..."
                              filterType="all" // Allow any type for X
                           />
                           <SelectInput
                              label="Y-Axis Parameter"
                              value={selectedChart.yParameter}
                              onChange={(e) => handleYChange(selectedChart.id, e.target.value)}
                              options={sourceHeaders} // Use headers from dataSourceStore
                              placeholder="Select Y parameter..."
                              filterType="all" // Suggest numeric for Y by default
                           />
                        </div>
                      )}

                      {/* Visualize Tab */}
                      {activeTab === 'visualize' && (
                        <div>
                          {/* ... (Chart Type and Color selection remain the same) ... */}
                           <label className="block text-sm font-medium text-gray-600 mb-2">Chart Type</label>
                          <div className="grid grid-cols-4 gap-2 mb-4"> {/* Adjusted grid cols */}
                            {(['bar', 'line', 'area', 'pie', 'radar', 'radial', 'funnel'] as ChartConfig['chartType'][]).map((type) => (
                              <button key={type} onClick={() => handleChartTypeChange(selectedChart.id, type)} className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs transition-colors ${ selectedChart.chartType === type ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300' }`} >
                                {getChartIcon(type)}
                                <span className="mt-1 capitalize">{type || 'N/A'}</span>
                              </button>
                            ))}
                          </div>

                          <label className="block text-sm font-medium text-gray-600 mb-2">Color</label>
                          <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map((color) => (
                              <button key={color} onClick={() => handleColorChange(selectedChart.id, color)} className={`w-6 h-6 rounded-full border-2 transition-transform transform hover:scale-110 ${ selectedChart.color === color ? 'border-gray-700 ring-2 ring-offset-1 ring-gray-500' : 'border-white shadow-sm' }`} style={{ backgroundColor: color }} aria-label={`Select color ${color}`} />
                            ))}
                          </div>
                        </div>
                      )}

                       {/* Filter Tab */}
                      {activeTab === 'filter' && (
                        <div>
                          {/* Date Filter */}
                          {showDateFilter ? (
                            <div className="mb-4">
                              {/* ... (Date filter buttons remain the same) ... */}
                               <label className="block text-sm font-medium text-gray-600 mb-2">Group Date By (X-Axis)</label>
                              <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
                                {( [null, 'Y', 'M', 'W', 'D'] as (('Y' | 'M' | 'W' | 'D' | null)[]) ).map((unit) => (
                                  <button key={unit || 'none'} onClick={() => handleDateFilterChange(selectedChart.id, unit)} className={`flex-1 px-2 py-1 text-xs rounded ${ selectedChart.dateFilterType === unit ? 'bg-white shadow text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-200' }`} > {unit ? unit : 'None'} </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                             <p className="text-sm text-gray-500 mb-4 bg-yellow-50 p-2 rounded border border-yellow-200">Date grouping available for Line/Area charts with a Date type X-axis.</p>
                          )}

                          {/* Number Filter (Sorting) */}
                          {showNumberFilter ? (
                            <div>
                              {/* ... (Number filter buttons remain the same) ... */}
                               <label className="block text-sm font-medium text-gray-600 mb-2">Sort By (Y-Axis)</label>
                               <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
                                {( [null, 'increasing', 'decreasing'] as (('increasing' | 'decreasing' | null)[]) ).map((order) => (
                                  <button key={order || 'none'} onClick={() => handleNumberFilterChange(selectedChart.id, order)} className={`flex-1 px-2 py-1 text-xs rounded flex items-center justify-center gap-1 ${ selectedChart.numberFilterType === order ? 'bg-white shadow text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-200' }`} >
                                    {order === 'increasing' ? <ArrowUp size={12} /> : order === 'decreasing' ? <ArrowDown size={12} /> : null}
                                    {order ? order.charAt(0).toUpperCase() + order.slice(1) : 'None'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                             <p className="text-sm text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">Y-Axis sorting requires a Numeric type Y-axis.</p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};