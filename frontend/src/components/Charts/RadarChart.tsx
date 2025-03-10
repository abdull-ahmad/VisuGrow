import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { COLORS, TOOLTIP_STYLE } from "../../constants/ChartConstants";

interface RadarChartComponentProps {
    data: {
        data: any[];
        categories: string[];
    };
}

export const RadarChartComponent: React.FC<RadarChartComponentProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="60%" data={data.data}>
                <PolarGrid strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#666' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#999' }} />
                {data.categories.map((category: string, index: number) => (
                    <Radar
                        key={category}
                        dataKey={category}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.6}
                    />
                ))}
                <Legend
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
        </ResponsiveContainer>
    );
};