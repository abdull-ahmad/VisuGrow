import useDemoConfig from "../../useDemoConfig";
import React from "react";
import { AxisOptions, Chart } from "react-charts";

export default function Bar() {
  const { data } = useDemoConfig({
    series: 2,
    dataType: "ordinal",
  });

  const primaryAxis = React.useMemo<
    AxisOptions<typeof data[number]["data"][number]>
  >(
    () => ({
      getValue: (datum) => datum.primary,
    }),
    []
  );

  const secondaryAxes = React.useMemo<
    AxisOptions<typeof data[number]["data"][number]>[]
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
            data,
            primaryAxis,
            secondaryAxes,
          }}
        />
      
    </>
  );
}
