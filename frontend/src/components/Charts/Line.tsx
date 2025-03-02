import useDemoConfig from "../../useDemoConfig";
import React from "react";
import { AxisOptions, Chart } from "react-charts";

interface LineProps {
  chartData: {
    label: string;
    data: { primary: any; secondary: any }[];
  }[];
  xLabel: string;
  yLabel: string;
}

export default function Line({ chartData }: LineProps) {
  
  const primaryAxis = React.useMemo<
    AxisOptions<any>
  >(
    () => ({
      getValue: (datum) => datum.primary as unknown as Date,

    }),
    []
  );

  const secondaryAxes = React.useMemo<
    AxisOptions<any>[]
  >(
    () => [
      {
        getValue: (datum) => datum.secondary,
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
