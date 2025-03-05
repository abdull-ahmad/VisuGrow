import React from 'react';
import { Chart, AxisOptions } from 'react-charts';

interface BarProps {
  chartData: {
    label: string;
    data: { primary: any; secondary: any }[];
    color?: string;
  }[];
  xLabel: string;
  yLabel: string;
}

export default function Bar({ chartData, xLabel, yLabel }: BarProps) {

  const primaryAxis = React.useMemo<AxisOptions<any>>(
    () => ({
      getValue: (datum) => datum.primary,
      position: 'bottom',
      label: xLabel,
    }),
    [xLabel, chartData]
  );

  const secondaryAxes = React.useMemo<AxisOptions<any>[]>(
    () => [
      {
        getValue: (datum) => datum.secondary,
        position: 'left',
        label: yLabel,
      },
    ],
    [yLabel, chartData]
  );

  return (

    <div className="h-full w-full flex flex-col">
      <Chart
        options={{
          data: chartData,
          primaryAxis,
          secondaryAxes,
          defaultColors: [chartData[0]?.color || '#3b82f6'],
        }}
      />
      <div className="flex justify-center gap-4 mt-2">
        {chartData.map((series) => (
          <div key={series.label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: series.color || '#3b82f6' }}
            />
            <span className="text-sm">{series.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}