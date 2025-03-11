import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TimeScale } from "../../types/visualization";
import { BASE_CHART_PROPS, TOOLTIP_STYLE } from "../../constants/ChartConstants";
import { formatDateByScale } from "../../utils/dateScaler";

export const LineChartComponent: React.FC<{ 
    data: any[]; 
    xParameter: string; 
    yParameter: string; 
    color: any; 
    isDateField: boolean;
    timeScale: TimeScale;
}> = ({ data, xParameter, yParameter, color, isDateField, timeScale }) => (
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} {...BASE_CHART_PROPS} syncId='anyId'>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
                dataKey="primary"
                name={xParameter}
                type={isDateField ? "category" : "number"}
                tickFormatter={(value) => {
                    return value instanceof Date ? formatDateByScale(value, timeScale) : value;
                }}
                tick={{ fontSize: 11, fill: '#666' }}
                tickLine={{ stroke: '#ccc' }}
                axisLine={{ stroke: '#ccc' }}
            />
            <YAxis
                name={yParameter}
                tick={{ fontSize: 11, fill: '#666' }}
                tickLine={{ stroke: '#ccc' }}
                axisLine={{ stroke: '#ccc' }}
            />
            <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={(value) => {
                    return value instanceof Date ? formatDateByScale(value, timeScale) : value;
                }}
            />
            <Legend
                verticalAlign="top"
                height={36}
                iconType="line"
                formatter={(value) => <span className="text-xs font-medium">{value}</span>}
            />
            <Line
                connectNulls
                type="monotone"
                dataKey="secondary"
                name={`${yParameter} vs ${xParameter}`}
                stroke={color || "#3b82f6"}
                strokeWidth={3}
                dot={{ fill: color || "#3b82f6", r: 4 }}
                activeDot={{ r: 6, fill: color || "#3b82f6", stroke: "white", strokeWidth: 2 }}
            />
        </LineChart>
    </ResponsiveContainer>
);