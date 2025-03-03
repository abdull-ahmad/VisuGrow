import React from 'react';
import { Chart, AxisOptions } from 'react-charts';
import useDemoConfig from "../../useDemoConfig";

export default function Bar() {

  const { data } = useDemoConfig({
          series: 2,
          dataType: "ordinal",
      });
  
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
          data,
          primaryAxis,
          secondaryAxes,
          
        }}
      />
    </>
  );
}