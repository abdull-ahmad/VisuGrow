import React from 'react';
import Bar from '../Charts/Bar';
import { useDataStore } from '../../store/dataStore';
import { ChartConfig } from '../../pages/Visualization/VisualizationPage';

interface ChartCanvasProps {
  charts: ChartConfig[];
  onSelectChart?: (chartId: string) => void;
}

const SingleChart: React.FC<{ chart: ChartConfig; onSelectChart?: (chartId: string) => void }> = ({ chart, onSelectChart }) => {
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
        content = <Bar chartData={chartData} xLabel={chart.xParameter} yLabel={chart.yParameter} />;
        break;
      // Add cases for 'line' and 'area' when components are available
      default:
        content = <div>Unsupported chart type</div>;
    }
  }

  return (
    <div
      className="relative h-fit w-fit p-4 border rounded-lg shadow-sm overflow-hidden cursor-pointer"
      onClick={() => onSelectChart && onSelectChart(chart.id)}
    >
      {content}
    </div>
  );
};

export const ChartCanvas: React.FC<ChartCanvasProps> = ({ charts, onSelectChart }) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {charts.map((chart) => (
        <SingleChart key={chart.id} chart={chart} onSelectChart={onSelectChart} />
      ))}
    </div>
  );
};