import React from "react";
import useDemoConfig from "../../useDemoConfig";
import { AxisOptions, Chart } from "react-charts";

export default function Bar() {
    const { data } = useDemoConfig({
        series: 2,
        dataType: "time",
    });

    const primaryAxis = React.useMemo<
        AxisOptions<typeof data[number]["data"][number]>
    >(
        () => ({
            getValue: (datum) => datum.primary as Date,
        }),
        []
    );

    const secondaryAxes = React.useMemo<
        AxisOptions<typeof data[number]["data"][number]>[]
    >(
        () => [
            {
                getValue: (datum) => datum.secondary,
                stacked: true,

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
