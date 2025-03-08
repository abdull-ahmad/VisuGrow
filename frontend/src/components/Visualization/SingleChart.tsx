import React, { useEffect, useState } from 'react';
import {
    BarChart, LineChart, AreaChart, PieChart, RadarChart, RadialBarChart, FunnelChart,
    XAxis, YAxis, Tooltip, Legend, Bar, Line, Area, Pie, Cell, Funnel,
    Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBar,
    ResponsiveContainer, Sector, CartesianGrid, LabelList
} from 'recharts';
import { useDataStore } from '../../store/dataStore';
import {
    Trash,BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
    AreaChart as AreaChartIcon, Radar as RadarIcon, Activity,
    TrendingDown, Info,
    Download,
    GripHorizontal
} from 'lucide-react';
import { TimeScale } from '../../types/Chart';
import { groupDataByTimeScale, formatDateByScale } from '../../utils/dateScaler';
import { ChartConfig } from '../../types/Chart';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { motion } from 'framer-motion';

export const SingleChart: React.FC<{
    chart: ChartConfig;
    onSelect: () => void;
    onDelete: () => void;
    onDownload: () => void;
}> = ({ chart, onSelect, onDelete ,onDownload }) => {
    const { fileData, fileHeaders } = useDataStore();
    const [timeScale, setTimeScale] = useState<TimeScale>('year');
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (chart.dateFilterType) {
            setTimeScale(chart.dateFilterType);
        }
    }, [chart.dateFilterType]);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle,
            fill, payload, percent, value } = props;

        return (
            <g>
                <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="font-medium text-sm">
                    {payload.name}
                </text>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" className="font-bold">
                    {`${value}`}
                </text>
                <text x={cx} y={cy} dy={25} textAnchor="middle" fill="#666" className="text-xs">
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
            </g>
        );
    };

    // Enhanced color palette with better contrast
    const COLORS = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6'
    ];

    const getParameterType = (paramName: string) => {
        const header = fileHeaders?.find((h: any) => h.name === paramName);
        return header?.type || null;
    };

    const getChartIcon = () => {
        switch (chart.chartType) {
            case 'bar': return <BarChart3 size={18} />;
            case 'line': return <LineChartIcon size={18} />;
            case 'area': return <AreaChartIcon size={18} />;
            case 'pie': return <PieChartIcon size={18} />;
            case 'radar': return <RadarIcon size={18} />;
            case 'radial': return <Activity size={18} />;
            case 'funnel': return <TrendingDown size={18} />;
            default: return <BarChart3 size={18} />;
        }
    };

    const isDateField = getParameterType(chart.xParameter) === 'date';

    const chartData: any = React.useMemo(() => {
        if (!fileData || !chart.xParameter || !chart.yParameter) return [];

        const isLineChart = chart.chartType === 'line' || chart.chartType === 'area';
        const isPieChart = chart.chartType === 'pie';
        const isRadarChart = chart.chartType === 'radar';
        const isRadialChart = chart.chartType === 'radial';
        const isFunnelChart = chart.chartType === 'funnel';

        // Properly convert strings to Date objects when needed for line/area charts
        const rawData = fileData.map((item: any) => {
            let primary = item[chart.xParameter];
            if (isLineChart && isDateField) {
                try {
                    primary = primary instanceof Date ? primary : new Date(primary);
                    if (isNaN(primary.getTime())) {
                        console.warn('Invalid date value:', item[chart.xParameter]);
                        primary = new Date();
                    }
                } catch (e) {
                    console.error('Error converting to date:', e);
                    primary = new Date(); // Default to current date as fallback
                }
            }
            return {
                primary,
                secondary: parseFloat(item[chart.yParameter]) || 0,
            };
        });

        let processedData;

        // Apply date filtering using the chart's dateFilterType
        const currentTimeScale = chart.dateFilterType || timeScale;

        if (isLineChart && isDateField) {
            processedData = groupDataByTimeScale(rawData, currentTimeScale);
        } else if (chart.chartType === 'bar') {
            // Aggregate data for bar charts
            const categoryMap = rawData.reduce((acc: Record<string | number, number>, item) => {
                const key = item.primary?.toString() || 'undefined';
                acc[key] = (acc[key] || 0) + item.secondary;
                return acc;
            }, {});
            processedData = Object.entries(categoryMap).map(([category, value]) => ({
                primary: category,
                secondary: value as number
            }));
        } else if (isPieChart || isRadialChart || isFunnelChart) {
            
            const categoryMap = rawData.reduce((acc: Record<string | number, number>, item) => {
                const key = item.primary?.toString() || 'undefined';
                acc[key] = (acc[key] || 0) + item.secondary;
                return acc;
            }, {});

            processedData = Object.entries(categoryMap).map(([category, value], index) => ({
                name: category,
                value: value as number,
                fill: COLORS[index % COLORS.length]
            }));

            // Sort data by value for funnel chart
            if (isFunnelChart) {
                processedData.sort((a, b) => b.value - a.value);
            }
        } else if (isRadarChart) {
            // Group data for radar chart
            const categoryMap: Record<string, Record<string, number>> = {};

            fileData.forEach((item: any) => {
                const category = item[chart.xParameter]?.toString() || 'undefined';
                const subCategory = item[chart.yParameter]?.toString() || 'unknown';

                if (!categoryMap[category]) {
                    categoryMap[category] = {};
                }

                categoryMap[category][subCategory] = (categoryMap[category][subCategory] || 0) + 1;
            });

            const allSubCategories = new Set<string>();
            Object.values(categoryMap).forEach(subcategories => {
                Object.keys(subcategories).forEach(key => allSubCategories.add(key));
            });

            processedData = Object.entries(categoryMap).map(([category, values]) => {
                const item: any = { subject: category };
                Array.from(allSubCategories).forEach(subCat => {
                    item[subCat] = values[subCat] || 0;
                });
                return item;
            });

            return {
                data: processedData,
                categories: Array.from(allSubCategories)
            };
        } else {
            processedData = rawData;
        }

        // Apply number filtering if it's set
        if (chart.numberFilterType && processedData && processedData.length > 0) {
            switch (chart.numberFilterType) {
                case 'increasing':
                    processedData.sort((a: any, b: any) => a.secondary - b.secondary || a.value - b.value);
                    break;
                case 'decreasing':
                    processedData.sort((a: any, b: any) => b.secondary - a.secondary || b.value - a.value);
                    break;
            }
        }

        return [{
            label: `${chart.yParameter} vs ${chart.xParameter}`,
            data: processedData,
            color: chart.color,
        }];
    }, [fileData, chart.xParameter, chart.yParameter, chart.color, timeScale, chart.chartType, chart.dateFilterType, chart.numberFilterType]);

    let content;
    if (!fileData || fileData.length === 0) {
        content = (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <Info size={24} />
                </div>
                <p className="text-lg font-medium">No Data Available</p>
                <p className="text-sm">Upload data to see visualization</p>
            </div>
        );
    } else if (!chart.chartType) {
        content = (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <Info size={24} />
                </div>
                <p className="text-lg font-medium">Select Chart Type</p>
                <p className="text-sm">Configure your visualization to begin</p>
            </div>
        );
    } else if (!chart.xParameter || !chart.yParameter) {
        content = (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <Info size={24} />
                </div>
                <p className="text-lg font-medium">Select Parameters</p>
                <p className="text-sm">Choose X and Y parameters to visualize</p>
            </div>
        );
    } else {
        const baseProps = {
            margin: { top: 30, right: 30, left: 20, bottom: 40 },
        };

        switch (chart.chartType) {
            case 'bar':
                content = (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData[0]?.data}
                            {...baseProps}
                        >
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
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 12px',
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                            />
                            <Bar
                                dataKey="secondary"
                                fill={chart.color || "#3b82f6"}
                                maxBarSize={50}
                                name={`${chart.yParameter} vs ${chart.xParameter}`}
                                radius={[4, 4, 0, 0]}
                            >
                                <LabelList
                                    dataKey="secondary"
                                    position="top"
                                    style={{
                                        fontSize: '10px',
                                        fill: '#666'
                                    }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
                break;
            case 'line':
                content = (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData[0]?.data}
                            {...baseProps}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                                dataKey="primary"
                                name={chart.xParameter}
                                type={isDateField ? "category" : "number"}
                                tickFormatter={(value) => {
                                    return value instanceof Date ? formatDateByScale(value, timeScale) : value;
                                }}
                                tick={{ fontSize: 11, fill: '#666' }}
                                tickLine={{ stroke: '#ccc' }}
                                axisLine={{ stroke: '#ccc' }}
                            />
                            <YAxis
                                name={chart.yParameter}
                                tick={{ fontSize: 11, fill: '#666' }}
                                tickLine={{ stroke: '#ccc' }}
                                axisLine={{ stroke: '#ccc' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 12px',
                                }}
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
                                type="monotone"
                                dataKey="secondary"
                                name={`${chart.yParameter} vs ${chart.xParameter}`}
                                stroke={chart.color || "#3b82f6"}
                                strokeWidth={3}
                                dot={{ fill: chart.color || "#3b82f6", r: 4 }}
                                activeDot={{ r: 6, fill: chart.color || "#3b82f6", stroke: "white", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
                break;
            case 'area':
                content = (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData[0]?.data}
                            {...baseProps}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                                dataKey="primary"
                                name={chart.xParameter}
                                type={isDateField ? "category" : "number"}
                                tickFormatter={(value) => {
                                    return value instanceof Date ? formatDateByScale(value, timeScale) : value;
                                }}
                                tick={{ fontSize: 11, fill: '#666' }}
                                tickLine={{ stroke: '#ccc' }}
                                axisLine={{ stroke: '#ccc' }}
                            />
                            <YAxis
                                name={chart.yParameter}
                                tick={{ fontSize: 11, fill: '#666' }}
                                tickLine={{ stroke: '#ccc' }}
                                axisLine={{ stroke: '#ccc' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 12px',
                                }}
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
                                    <stop offset="5%" stopColor={chart.color || "#3b82f6"} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={chart.color || "#3b82f6"} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="secondary"
                                name={`${chart.yParameter} vs ${chart.xParameter}`}
                                fill="url(#colorGradient)"
                                stroke={chart.color || "#3b82f6"}
                                strokeWidth={2}
                                activeDot={{ r: 6, fill: chart.color || "#3b82f6", stroke: "white", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );
                break;
            case 'pie':
                content = (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={chartData[0]?.data}
                                cx="50%"
                                cy="50%"
                                innerRadius="45%"
                                outerRadius="65%"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            >
                                {chartData[0]?.data.map((entry: any, index: number) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="white"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`${value}`, chart.yParameter]}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 12px',
                                }}
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
                break;
            case 'radar':
                const radarData = chartData as any;
                content = (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius="60%" data={radarData.data}>
                            <PolarGrid strokeOpacity={0.2} />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#666' }} />
                            <PolarRadiusAxis tick={{ fontSize: 10, fill: '#999' }} />
                            {radarData.categories.map((category: string, index: number) => (
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
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 12px',
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                );
                break;
            case 'radial':
                content = (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="20%"
                            outerRadius="80%"
                            barSize={12}
                            data={chartData[0]?.data}
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
                                {chartData[0]?.data.map((entry: any, index: number) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </RadialBar>
                            <Tooltip
                                formatter={(value) => [`${value}`, chart.yParameter]}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 12px',
                                }}
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
                break;
            case 'funnel':
                content = (
                    <ResponsiveContainer width="100%" height="100%">
                        <FunnelChart
                            {...baseProps}
                        >
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 12px',
                                }}
                            />
                            <Funnel
                                dataKey="value"
                                nameKey="name"
                                data={chartData[0]?.data}
                                isAnimationActive={true}
                            >
                                {chartData[0]?.data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                <LabelList
                                    position="right"
                                    fill="#333"
                                    fontSize={11}
                                    formatter={(value: any) => `${value.name}: ${value.value}`}
                                />
                            </Funnel>
                        </FunnelChart>
                    </ResponsiveContainer>
                );
                break;

            default:
                content = (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                            <Info size={24} />
                        </div>
                        <p className="text-lg font-medium">Unsupported Chart Type</p>
                        <p className="text-sm">Please select a different chart type</p>
                    </div>
                );
        }
    }

    return (
        <motion.div
            className="relative h-full w-full overflow-hidden bg-white rounded-xl border border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            id={`chart-${chart.id}`}
            onClick={onSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        >
            {/* Chart Header */}
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="p-1.5 rounded-md bg-blue-100 text-blue-600 mr-2 flex-shrink-0">
                        {getChartIcon()}
                    </span>
                    <div className="overflow-hidden">
                        <h3 className="font-medium text-sm text-gray-700 truncate">
                            {chart.chartType?.charAt(0).toUpperCase() + chart.chartType?.slice(1)} Chart
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                            {chart.xParameter && chart.yParameter
                                ? `${chart.yParameter} vs ${chart.xParameter}`
                                : 'No parameters selected'}
                        </p>
                    </div>
                </div>

                {/* Actions overlay with animation */}
                <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="drag-handle flex items-center cursor-move px-2 py-1 rounded hover:bg-gray-200">
                          <GripHorizontal size={16} className="text-gray-500" />
                        </div>
                    <Tippy content="Download Chart">
                        <motion.button
                            onClick={(e) => { e.stopPropagation(); onDownload(); }}
                            className="p-1.5 bg-white rounded-md text-gray-500 hover:text-blue-600 transition-colors border border-gray-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Download size={16} />
                        </motion.button>
                    </Tippy>

                    <Tippy content="Delete Chart">
                        <motion.button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1.5 bg-white rounded-md text-gray-500 hover:text-red-600 transition-colors border border-gray-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Trash size={16} />
                        </motion.button>
                    </Tippy>
                </motion.div>
            </div>

            {/* Chart Content */}
            <div className="p-4 h-[calc(100%-48px)]">
                {content}
            </div>
        </motion.div>
    );
};