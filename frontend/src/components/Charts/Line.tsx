import React from "react";
import { AxisOptions, Chart } from "react-charts";
import { TimeScale } from "../../types/Chart";
import {TimeScaleControls} from "./TimeScaleControls";
import { formatDateByScale } from "../../utils/dateScaler";

interface LineProps {
  chartData: {
    label: string;
    data: { primary: any; secondary: any }[];
    color?: string;
  }[];
  xLabel: string;
  yLabel: string;
  timeScale: TimeScale;
  onTimeScaleChange: (scale: TimeScale) => void;
}
export default function Line({ chartData, xLabel, yLabel , timeScale , onTimeScaleChange }: LineProps) {
  const formattedData = React.useMemo(() => {
    return chartData.map(series => ({
      ...series,
      data: series.data.map(point => ({
        ...point,
        primary: new Date(point.primary), // Ensure primary is Date object
      }))
    }));
  }, [chartData]);

  const primaryAxis = React.useMemo<AxisOptions<any>>(
    () => ({
      getValue: (datum) => datum.primary,
      position: 'bottom',
      label: xLabel,
      scaleType: 'time',
      formatters: {
        scale: (date: Date) => formatDateByScale(date, timeScale), 
      },
    }),
    [xLabel, timeScale]
  );

  const secondaryAxes = React.useMemo<AxisOptions<any>[]>(
    () => [
      {
        getValue: (datum) => datum.secondary,
        position: 'left',
        label: yLabel,
        scaleType: 'linear',
      },
    ],
    [yLabel]
  );

  return (
    <div className="h-full w-full flex flex-col">
      <TimeScaleControls scale={timeScale} setScale={onTimeScaleChange} />
      <Chart
        options={{
          data: formattedData,
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