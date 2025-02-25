import React from 'react';
import { Chart, AxisOptions } from 'react-charts';
import ResizableBox from '../../utils/ResizableBox';

interface BarProps {
  chartData: {
    label: string;
    data: { primary: any; secondary: any }[];
  }[];
  xLabel: string;
  yLabel: string;
}

export default function Bar({ chartData, xLabel, yLabel }: BarProps) {
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
    <ResizableBox>
      <Chart
        options={{
          data: chartData,
          primaryAxis,
          secondaryAxes,
        }}
      />
    </ResizableBox>
    </>
  );
}