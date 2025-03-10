import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TOOLTIP_STYLE, BASE_CHART_PROPS } from '../../constants/ChartConstants';

export const BarChartComponent: React.FC<{ data: any[]; xParameter: string; yParameter: string; color: any }> = 
    ({ data, xParameter, yParameter, color }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} {...BASE_CHART_PROPS}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
                dataKey="primary"
                type="category"
                tick={{ fontSize: 11, fill: '#666' }}
                tickLine={{ stroke: '#ccc' }}
                axisLine={{ stroke: '#ccc' }}
            />
            <YAxis
                tick={{ fontSize: 11, fill: '#666' }}
                tickLine={{ stroke: '#ccc' }}
                axisLine={{ stroke: '#ccc' }}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-xs font-medium">{value}</span>}
            />
            <Bar
                dataKey="secondary"
                fill={color || "#3b82f6"}
                maxBarSize={50}
                name={`${yParameter} vs ${xParameter}`}
                radius={[4, 4, 0, 0]}
            >
                <LabelList
                    dataKey="secondary"
                    position="top"
                    style={{ fontSize: '10px', fill: '#666' }}
                />
            </Bar>
        </BarChart>
    </ResponsiveContainer>
);