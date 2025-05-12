import { PieChartDataItem } from "../../types/visualization";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { COLORS, TOOLTIP_STYLE } from "../../constants/ChartConstants";

interface PieChartComponentProps {
    data: any[];
    xParameter: string;
    yParameter: string;
    color?: string;
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({ 
    data, 
    yParameter, 
    xParameter,
    color 
}) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="65%"
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={3}
                >
                    {data.map((entry: PieChartDataItem, index: number) => (
                        <Cell
                            key={`cell-${index}`}
                            stroke="white"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => [`${value}`, `${yParameter} for ${xParameter}`]}
                    contentStyle={TOOLTIP_STYLE}
                />
                <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};