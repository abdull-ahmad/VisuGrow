import React, { useState, useEffect, useRef } from 'react';
import { useDataStore } from '../../store/dataStore';
import { ChartConfig, VisualizationPanelProps } from '../../types/visualization';
import {
  ChartArea, ChartBar, ChartLine, ChartPie,
  Cone, Radar, Radiation, Trash2, Plus,
  ArrowUp, ArrowDown, Calendar, Hash, X, Settings,
  BarChart3, PieChart, LineChart, AreaChart, ChevronRight, ChevronLeft,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import './custom.css'

const COLOR_PRESETS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6'
];

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  charts,
  addChart,
  updateChart,
  onRemoveChart,
}) => {
  const { fileHeaders } = useDataStore();
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('type');
  const [expanded, setExpanded] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const selectedChart = charts.find((chart) => chart.id === selectedChartId);

  useEffect(() => {
    if (charts.length > 0 && !selectedChartId) {
      setSelectedChartId(charts[0].id);
    }
  }, [charts, selectedChartId]);

  const handleAddChart = () => {
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      chartType: 'bar',
      xParameter: '',
      yParameter: '',
      color: COLOR_PRESETS[0],
    };
    addChart(newChart);
    setSelectedChartId(newChart.id);

    // Auto-scroll to the newly added chart
    setTimeout(() => {
      if (chartContainerRef.current) {
        chartContainerRef.current.scrollLeft = chartContainerRef.current.scrollWidth;
      }
    }, 100);
  };

  const handleChartTypeChange = (chartId: string, newType: 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'radial' | 'funnel') => {
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

  const handleDateFilterChange = (chartId: string, filterType: 'Y' | 'M' | 'W' | 'D') => {
    updateChart(chartId, { dateFilterType: filterType });
  };

  const handleNumberFilterChange = (chartId: string, filterType: 'increasing' | 'decreasing' | null ) => {
    updateChart(chartId, { numberFilterType: filterType });
  };

  const handleDeleteChart = (chartId: string) => {
    onRemoveChart(chartId);
    if (selectedChartId === chartId) {
      setSelectedChartId(charts.find(c => c.id !== chartId)?.id || null);
    }
  };

  const getParameterType = (paramName: string) => {
    const header = fileHeaders?.find((h: any) => h.name === paramName);
    return header?.type || null;
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChart3 size={20} />;
      case 'line': return <LineChart size={20} />;
      case 'area': return <AreaChart size={20} />;
      case 'pie': return <PieChart size={20} />;
      case 'radar': return <Radar size={20} />;
      case 'radial': return <Radiation size={20} />;
      case 'funnel': return <Cone size={20} />;
      default: return <BarChart3 size={20} />;
    }
  };

  const scrollCharts = (direction: 'left' | 'right') => {
    if (chartContainerRef.current) {
      const scrollAmount = 100; // Adjust as needed
      const newPosition = direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

      chartContainerRef.current.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };

  // Update scroll position when container scrolls
  const handleScroll = () => {
    if (chartContainerRef.current) {
      setScrollPosition(chartContainerRef.current.scrollLeft);
    }
  };

  // Check if we can scroll in either direction
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = chartContainerRef.current
    ? chartContainerRef.current.scrollWidth > chartContainerRef.current.clientWidth + scrollPosition
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#4a8cbb3a] rounded-lg shadow-lg overflow-hidden border border-gray-200"
    >
      <div className="bg-[#4a8cbb3a] px-4 py-3 flex items-center justify-between"

      >
        <h2 className="text-lg font-rowdies flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Chart Builder
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          {expanded ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <div className="flex flex-col mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-gray-500">
                    {charts.length} {charts.length === 1 ? 'Chart' : 'Charts'}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddChart}
                    className="flex items-center gap-1 px-3 py-1.5 text-white rounded-md text-sm font-medium shadow-sm "
                    style={{ backgroundColor: '#053252' }}
                  >
                    <Plus size={16} /> New Chart
                  </motion.button>
                </div>

                {charts.length > 0 && (
                  <div className="relative flex items-center">
                    {canScrollLeft && (
                      <button
                        onClick={() => scrollCharts('left')}
                        className="absolute left-0 z-10 p-1 bg-white rounded-full shadow-md border border-gray-200 text-gray-500 hover:text-blue-600"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}

                    <div
                      ref={chartContainerRef}
                      onScroll={handleScroll}
                      className="flex gap-2 overflow-x-auto py-2 px-5 scrollbar-hide max-w-full"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      {charts.map(chart => (
                        <Tippy key={chart.id} content={`Chart ${chart.id.substring(0, 4)}...`}>
                          <button
                            onClick={() => setSelectedChartId(chart.id)}
                            className={`relative p-2 rounded-md transition-all flex-shrink-0 border-2 ${chart.id === selectedChartId
                              ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                          >
                            {getChartIcon(chart.chartType)}
                            {chart.id === selectedChartId && (
                              <motion.div
                                layoutId="selected-chart"
                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500"
                              />
                            )}
                          </button>
                        </Tippy>
                      ))}
                    </div>

                    {canScrollRight && (
                      <button
                        onClick={() => scrollCharts('right')}
                        className="absolute right-0 z-10 p-1 bg-white rounded-full shadow-md border border-gray-200 text-gray-500 hover:text-blue-600"
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {charts.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="mx-auto bg-white rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-sm">
                    <PieChart className="text-blue-400" size={28} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">No Charts Yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Create your first chart to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddChart}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: '#053252' }}
                  >
                    <Plus size={18} /> Create Chart
                  </motion.button>
                </div>
              )}

              {selectedChart && (
                <>
                  <div className="flex border-b gap-1 mb-4 mt-4 bg-gray-50 rounded-t-lg">
                    {['type', 'data', 'style'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium relative ${activeTab === tab
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="active-tab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                          />
                        )}
                      </button>
                    ))}
                    <div className="ml-auto">
                      <Tippy content="Delete chart">
                        <button
                          onClick={() => handleDeleteChart(selectedChart.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tippy>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-b-lg p-4 border border-gray-100 shadow-sm"
                    >
                      {activeTab === 'type' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Chart Type</label>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { type: 'bar', icon: <ChartBar />, label: 'Bar' },
                                { type: 'line', icon: <ChartLine />, label: 'Line' },
                                { type: 'area', icon: <ChartArea />, label: 'Area' },
                                { type: 'pie', icon: <ChartPie />, label: 'Pie' },
                                { type: 'radar', icon: <Radar />, label: 'Radar' },
                                { type: 'radial', icon: <Radiation />, label: 'Radial' },
                                { type: 'funnel', icon: <Cone />, label: 'Funnel' },
                              ].map(item => (
                                <Tippy key={item.type} content={`${item.label} Chart`}>
                                  <button
                                    onClick={() => handleChartTypeChange(selectedChart.id, item.type as any)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all border-2 ${selectedChart.chartType === item.type
                                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                      : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-gray-100 text-gray-700'
                                      }`}
                                  >
                                    <div className="mb-1">{item.icon}</div>
                                    <span className="text-xs font-medium">{item.label}</span>
                                  </button>
                                </Tippy>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'data' && (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center mb-3">
                              <div className="p-2 rounded-md bg-blue-100 text-blue-700 mr-3">
                                <Hash size={16} />
                              </div>
                              <label className="block text-sm font-medium">X-Axis Parameter</label>
                            </div>
                            <select
                              value={selectedChart.xParameter || ''}
                              onChange={(e) => handleXChange(selectedChart.id, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                              <option value="">Select X-axis...</option>
                              {fileHeaders?.map((header: any) => (
                                <option key={header._id} value={header.name}>
                                  {header.name} ({header.type})
                                </option>
                              ))}
                            </select>

                            {selectedChart.xParameter && getParameterType(selectedChart.xParameter) === 'date' && (
                              <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                                <div className="flex items-center mb-2">
                                  <Calendar size={14} className="mr-1 text-blue-500" />
                                  <span className="text-xs font-medium text-gray-700">Date Grouping</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  {['Y', 'M', 'W', 'D'].map(period => (
                                    <button
                                      key={period}
                                      onClick={() => handleDateFilterChange(selectedChart.id, period as any)}
                                      className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedChart.dateFilterType === period
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                                        }`}
                                    >
                                      {period.charAt(0).toUpperCase() + period.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center mb-3">
                              <div className="p-2 rounded-md bg-green-100 text-green-700 mr-3">
                                <Hash size={16} />
                              </div>
                              <label className="block text-sm font-medium">Y-Axis Parameter</label>
                            </div>
                            <select
                              value={selectedChart.yParameter || ''}
                              onChange={(e) => handleYChange(selectedChart.id, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                            >
                              <option value="">Select Y-axis...</option>
                              {fileHeaders?.map((header: any) => (
                                <option key={header._id} value={header.name}>
                                  {header.name} ({header.type})
                                </option>
                              ))}
                            </select>

                            {selectedChart.yParameter && getParameterType(selectedChart.yParameter) === 'number' && (
                              <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                                <div className="flex items-center mb-2">
                                  <Hash size={14} className="mr-1 text-green-500" />
                                  <span className="text-xs font-medium text-gray-700">Value Sorting</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                  <button
                                    onClick={() => handleNumberFilterChange(selectedChart.id, null)}
                                    className={`flex items-center justify-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${!selectedChart.numberFilterType
                                      ? 'bg-gray-200 text-gray-800 border border-gray-300'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                                      }`}
                                  >
                                    <Ban size={14}/>
                                  </button>
                                  <button
                                    onClick={() => handleNumberFilterChange(selectedChart.id, 'increasing')}
                                    className={`flex items-center justify-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedChart.numberFilterType === 'increasing'
                                      ? 'bg-green-100 text-green-700 border border-green-300'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                                      }`}
                                  >
                                    <ArrowUp size={14}/>
                                  </button>
                                  <button
                                    onClick={() => handleNumberFilterChange(selectedChart.id, 'decreasing')}
                                    className={`flex items-center justify-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedChart.numberFilterType === 'decreasing'
                                      ? 'bg-green-100 text-green-700 border border-green-300'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                                      }`}
                                  >
                                    <ArrowDown size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'style' && (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium mb-3 text-gray-700">Chart Color</label>
                            <div className="mb-3 flex flex-wrap gap-2">
                              {COLOR_PRESETS.map(color => (
                                <Tippy key={color} content={color}>
                                  <button
                                    onClick={() => handleColorChange(selectedChart.id, color)}
                                    className={`w-8 h-8 rounded-full transition-all ${selectedChart.color === color
                                      ? 'ring-2 ring-offset-2 ring-blue-500 transform scale-110'
                                      : 'hover:scale-105'
                                      }`}
                                    style={{ backgroundColor: color }}
                                  />
                                </Tippy>
                              ))}
                            </div>
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <div className="flex items-center">
                                <div
                                  className="w-10 h-10 rounded mr-3"
                                  style={{ backgroundColor: selectedChart.color || '#3b82f6' }}
                                />
                                <input
                                  type="color"
                                  value={selectedChart.color || '#3b82f6'}
                                  onChange={(e) => handleColorChange(selectedChart.id, e.target.value)}
                                  className="w-full h-10 rounded cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};