import { Funnel, FunnelChart, ResponsiveContainer, Tooltip, LabelList } from "recharts";
import { TOOLTIP_STYLE } from "../../constants/ChartConstants";

interface FunnelChartComponentProps {
    data: any[];
    xParameter: string;
    yParameter: string;
    color?: string;
}

export const FunnelChartComponent: React.FC<FunnelChartComponentProps> = ({ 
    data, 
    xParameter, 
    yParameter,
    color 
}) => {
    // Process data to ensure names are displayable and assign colors
    const processedData = data.map((item, index) => ({
        ...item,
        // Ensure name is a string and not too long
        displayName: item.name?.toString() || 'Unknown',
        
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <FunnelChart margin={{ top: 20, right: 80, left: 20, bottom: 0 }}>
                <Tooltip 
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, name, props) => [
                        `${value}`, 
                        `${yParameter} for ${props.payload.displayName}`
                    ]} 
                />
                <Funnel
                    dataKey="value"
                    data={processedData}
                    isAnimationActive={true}
                    nameKey="displayName"
                >
                    {/* LabelList is more reliable than the label prop for Funnel */}
                    <LabelList 
                        position="right"
                        fill="#333"
                        fontSize={11}
                        dataKey="displayName"
                        stroke="none"
                    />
                </Funnel>
            </FunnelChart>
        </ResponsiveContainer>
    );
};