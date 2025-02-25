import React, { useState } from 'react';
import Sidebar from '../../components/SideBar';
import { useAuthStore } from '../../store/authStore';
import { ChartCanvas } from '../../components/Visualization/ChartCanvas';
import { FilePanel } from '../../components/Visualization/FilePanel';
import { VisualizationPanel } from '../../components/Visualization/VisualizationPanel';

export interface ChartConfig {
  id: string;
  chartType: 'bar' | 'line' | 'area' | null;
  xParameter: string;
  yParameter: string;
}

const VisualizationPage = () => {
  const { logout } = useAuthStore();
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

  const addChart = (chart: ChartConfig) => {
    setCharts((prev) => [...prev, chart]);
    setSelectedChartId(chart.id);
  };

  const updateChart = (id: string, updatedChart: Partial<ChartConfig>) => {
    setCharts((prev) =>
      prev.map((chart) =>
        chart.id === id ? { ...chart, ...updatedChart } : chart
      )
    );
  };

  const removeChart = (id: string) => {
    setCharts((prev) => prev.filter((chart) => chart.id !== id));
    
  };

  return (
    <div className="flex flex-row min-h-screen">
      <Sidebar isLoading={false} error={null} handleLogout={() => logout()} />
      <div className="flex flex-col min-h-screen w-full mainCenter">
        <ChartCanvas charts={charts} />
      </div>
      <div className="flex flex-col min-h-screen w-1/6 rounded-lg border-2 border-black sidebar">
        <VisualizationPanel
          charts={charts}
          addChart={addChart}
          updateChart={updateChart}
          removeChart={removeChart}
          selectedChartId={selectedChartId}
          setSelectedChartId={setSelectedChartId}
        />
      </div>
      <div className="flex flex-col min-h-screen w-1/6 sidebar rounded-lg border-2 border-black">
        <FilePanel />
      </div>
    </div>
  );
};

export default VisualizationPage;