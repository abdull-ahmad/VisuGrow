import { Cell, Legend, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChartDataItem } from "../../types/visualization";
import { COLORS, TOOLTIP_STYLE } from "../../constants/ChartConstants";

// Radial Bar Chart Component
interface RadialBarChartComponentProps {
    data: PieChartDataItem[];
    yParameter: string;
}

export const RadialBarChartComponent: React.FC<RadialBarChartComponentProps> = ({ data, yParameter }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="80%"
                barSize={12}
                data={data}
            >
                <RadialBar
                    background={{ fill: "#f3f4f6" }}
                    dataKey="value"
                    label={{
                        position: 'insideStart',
                        fill: '#fff',
                        fontSize: 11,
                        fontWeight: 'bold'
                    }}
                    cornerRadius={8}
                >
                    {data.map((_: PieChartDataItem, index: number) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </RadialBar>
                <Tooltip
                    formatter={(value) => [`${value}`, yParameter]}
                    contentStyle={TOOLTIP_STYLE}
                />
                <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                />
            </RadialBarChart>
        </ResponsiveContainer>
    );
};
