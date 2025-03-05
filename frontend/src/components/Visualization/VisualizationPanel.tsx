import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { ChartConfig, VisualizationPanelProps } from '../../types/Chart';
import { ChartArea, ChartColumnIncreasing, ChartLine } from 'lucide-react';

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  charts,
  addChart,
  updateChart,
}) => {
  const { fileHeaders } = useDataStore();
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

  const selectedChart = charts.find((chart) => chart.id === selectedChartId);

  const handleAddChart = () => {
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      chartType: 'bar',
      xParameter: '',
      yParameter: '',
    };
    addChart(newChart);
    setSelectedChartId(newChart.id);
  };

  const handleChartTypeChange = (chartId: string, newType: 'bar' | 'line' | 'area') => {
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

  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg shadow-sm mainCenter">
      <h2 className="text-lg font-rowdies mb-4">Visualization Settings</h2>
      <button
        onClick={handleAddChart}
        className="mb-4 w-full py-2 customColorButton text-white rounded-md "
      >
        Add New Chart
      </button>

      {charts.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 font-poppins">Select Chart</label>
            <select
              value={selectedChartId || ''}
              onChange={(e) => setSelectedChartId(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a chart...</option>
              {charts.map((chart) => (
                <option key={chart.id} value={chart.id}>
                  Chart {chart.id}
                </option>
              ))}
            </select>
          </div>

          {selectedChart && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 font-poppins">Chart Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleChartTypeChange(selectedChart.id, 'bar')}
                    className={`px-4 py-2 rounded-md ${selectedChart.chartType === 'bar'
                      ? 'customColorButton text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <ChartColumnIncreasing />
                  </button>
                  <button
                    onClick={() => handleChartTypeChange(selectedChart.id, 'line')}
                    className={`px-4 py-2 rounded-md ${selectedChart.chartType === 'line'
                      ? 'customColorButton text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <ChartLine />
                  </button>
                  <button
                    onClick={() => handleChartTypeChange(selectedChart.id, 'area')}
                    className={`px-4 py-2 rounded-md ${selectedChart.chartType === 'area'
                      ? 'customColorButton text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <ChartArea />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 font-poppins">X-Axis Parameter</label>
                <select
                  value={selectedChart.xParameter}
                  onChange={(e) => handleXChange(selectedChart.id, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select X-axis...</option>
                  {fileHeaders?.map((header: any) => (
                    <option key={header._id} value={header.name}>
                      {header.name} ({header.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 font-poppins">Y-Axis Parameter</label>
                <select
                  value={selectedChart.yParameter}
                  onChange={(e) => handleYChange(selectedChart.id, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Y-axis...</option>
                  {fileHeaders?.map((header: any) => (
                    <option key={header._id} value={header.name}>
                      {header.name} ({header.type})
                    </option>
                  ))}
                </select>
              </div>

              <label className="block text-sm font-medium mb-2 font-poppins">Chart Color</label>
              <input
                type="color"
                value={selectedChart.color || '#3b82f6'}
                onChange={(e) => handleColorChange(selectedChart.id, e.target.value)}
                className="w-full p-1 h-10 rounded cursor-pointer"
              />

            </>
          )}
        </div>
      )}
    </div >
  );
};