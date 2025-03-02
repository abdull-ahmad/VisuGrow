import React from 'react';
import { Chart, AxisOptions } from 'react-charts';

interface BarProps {
  chartData: {
    label: string;
    data: { primary: any; secondary: any }[];
  }[];
  xLabel: string;
  yLabel: string;
}

export default function Bar({ chartData }: BarProps) {
  const primaryAxis = React.useMemo<AxisOptions<any>>(
    () => ({
      getValue: (datum) => datum.primary,
    }),
    []
  );

  const secondaryAxes = React.useMemo<AxisOptions<any>[]>(
    () => [
      {
        getValue: (datum) => datum.secondary,
        scaleType: 'linear',
      },
    ],
    []

  );

  return (
    <>
      <Chart
        options={{
          data: chartData,
          primaryAxis,
          secondaryAxes,
          defaultColors: ['#3b82f6'],
          
        }}
      />
    </>
  );
}