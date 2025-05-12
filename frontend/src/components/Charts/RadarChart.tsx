import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { COLORS, TOOLTIP_STYLE } from "../../constants/ChartConstants";

interface RadarDataItem {
    subject: string;
    [key: string]: number | string; // For category values
}

interface RadarChartComponentProps {
    data: RadarDataItem[];
    categories: string[];
    xParameter: string;
    yParameter: string;
}

export const RadarChartComponent: React.FC<RadarChartComponentProps> = ({ 
    data, 
    categories, 
    xParameter,
    yParameter
}) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="60%" data={data}>
                <PolarGrid strokeOpacity={0.2} />
                <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 11, fill: '#666' }} 
                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value} 
                />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#999' }} />
                {categories.map((category: string, index: number) => (
                    <Radar
                        key={category}
                        name={category}
                        dataKey={category}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.6}
                    />
                ))}
                <Tooltip 
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, name, props) => [
                        `${value}`, 
                        `${name} for ${props.payload.subject}`
                    ]} 
                />
                <Legend 
                    iconSize={10}
                    formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};