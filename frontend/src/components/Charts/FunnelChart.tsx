import { Funnel, FunnelChart, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { PieChartDataItem } from "../../types/visualization";
import { BASE_CHART_PROPS, TOOLTIP_STYLE } from "../../constants/ChartConstants";

interface FunnelChartComponentProps {
    data: PieChartDataItem[];
    xParameter: string;
    yParameter: string;
}

export const FunnelChartComponent: React.FC<FunnelChartComponentProps> = ({ data, xParameter, yParameter }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <FunnelChart {...BASE_CHART_PROPS}>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Funnel
                    dataKey="value"
                    data={data}
                    isAnimationActive={true}
                    name={`${yParameter} vs ${xParameter}`}
                />
                <Legend
                    iconSize={10}
                    layout="horizontal"
                    formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                />
            </FunnelChart>
        </ResponsiveContainer>
    );
};