import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TimeScale } from "../../types/visualization";
import { BASE_CHART_PROPS, TOOLTIP_STYLE } from "../../constants/ChartConstants";
import { formatDateByScale } from "../../utils/dateScaler";

export const AreaChartComponent: React.FC<{ 
    data: any[]; 
    xParameter: string; 
    yParameter: string; 
    color: any; 
    isDateField: boolean;
    timeScale: TimeScale;
}> = ({ data, xParameter, yParameter, color, isDateField, timeScale }) => (
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} {...BASE_CHART_PROPS} syncId='anyId'>
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
                iconType="square"
                formatter={(value) => <span className="text-xs font-medium">{value}</span>}
            />
            <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color || "#3b82f6"} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color || "#3b82f6"} stopOpacity={0.1} />
                </linearGradient>
            </defs>
            <Area
                type="monotone"
                dataKey="secondary"
                name={`${yParameter} vs ${xParameter}`}
                fill="url(#colorGradient)"
                stroke={color || "#3b82f6"}
                strokeWidth={2}
                activeDot={{ r: 6, fill: color || "#3b82f6", stroke: "white", strokeWidth: 2 }}
            />
        </AreaChart>
    </ResponsiveContainer>
);