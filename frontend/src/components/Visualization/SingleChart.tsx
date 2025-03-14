import React, { useEffect, useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import {
    Trash, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
    AreaChart as AreaChartIcon, Radar as RadarIcon, Activity,
    TrendingDown, Download, GripHorizontal
} from 'lucide-react';
import { TimeScale, ChartDataItem, SingleChartProps } from '../../types/visualization';
import { groupDataByTimeScale } from '../../utils/dateScaler';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { motion } from 'framer-motion';
//Charts 
import { BarChartComponent } from '../Charts/BarChart';
import { LineChartComponent } from '../Charts/LineChart';
import { AreaChartComponent } from '../Charts/AreaChart';
import { PieChartComponent } from '../Charts/PieChart';
import { RadarChartComponent } from '../Charts/RadarChart';
import { RadialBarChartComponent } from '../Charts/RadialChart';
import { FunnelChartComponent } from '../Charts/FunnelChart';
import { EmptyStateDisplay } from '../Charts/SkeletonChart';
import { COLORS } from '../../constants/ChartConstants';

// Main Component
export const SingleChart: React.FC<SingleChartProps> = ({ chart, onSelect, onDelete, onDownload }) => {
    const { fileData, fileHeaders } = useDataStore();
    const [timeScale, setTimeScale] = useState<TimeScale>('Y');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (chart.dateFilterType) {
            setTimeScale(chart.dateFilterType);
        }
    }, [chart.dateFilterType]);

    const getParameterType = (paramName: string) => {
        const header = fileHeaders?.find((h: any) => h.name === paramName);
        return header?.type || null;
    };

    const isDateField = getParameterType(chart.xParameter) === 'date';

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

    // Process chart data
    const chartData = React.useMemo(() => {
        if (!fileData || !chart.xParameter || !chart.yParameter) return [];

        const processData = () => {
            const isLineChart = chart.chartType === 'line' || chart.chartType === 'area';
            const isPieChart = chart.chartType === 'pie';
            const isRadarChart = chart.chartType === 'radar';
            const isRadialChart = chart.chartType === 'radial';
            const isFunnelChart = chart.chartType === 'funnel';
            const currentTimeScale = chart.dateFilterType || timeScale;

            // Convert raw data
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
                        primary = new Date();
                    }
                }
                return {
                    primary,
                    secondary: parseFloat(item[chart.yParameter]) || 0,
                };
            });

            // Process by chart type
            if (isLineChart && isDateField) {
                return groupDataByTimeScale(rawData, currentTimeScale);
            }

            else if (chart.chartType === 'bar') {
                const categoryMap = aggregateByCategory(rawData);
                return Object.entries(categoryMap).map(([category, value]) => ({
                    primary: category,
                    secondary: value
                }));
            }

            else if (isPieChart || isRadialChart || isFunnelChart) {
                const categoryMap = aggregateByCategory(rawData);
                let result = Object.entries(categoryMap).map(([category, value], index) => ({
                    name: category,
                    value: value,
                    fill: COLORS[index % COLORS.length]
                }));

                if (isFunnelChart) {
                    result.sort((a, b) => b.value - a.value);
                }

                return result;
            }

            else if (isRadarChart) {
                return processRadarData();
            }

            else {
                return rawData;
            }
        };

        const aggregateByCategory = (data: ChartDataItem[]): Record<string | number, number> => {
            return data.reduce((acc: Record<string | number, number>, item) => {
                const key = item.primary?.toString() || 'undefined';
                acc[key] = (acc[key] || 0) + item.secondary;
                return acc;
            }, {});
        };

        const processRadarData = () => {
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

            const data = Object.entries(categoryMap).map(([category, values]) => {
                const item: any = { subject: category };
                Array.from(allSubCategories).forEach(subCat => {
                    item[subCat] = values[subCat] || 0;
                });
                return item;
            });

            return {
                data,
                categories: Array.from(allSubCategories)
            };
        };

        // Process the data
        let processedData = processData();

        // Apply number filtering if specified
        if (chart.numberFilterType && !Array.isArray(processedData) && processedData.data) {
            // Handle radar chart special case
            return processedData;
        } else if (chart.numberFilterType && Array.isArray(processedData)) {
            switch (chart.numberFilterType) {
                case 'increasing':
                    processedData.sort((a: any, b: any) =>
                        a.secondary !== undefined ? a.secondary - b.secondary : a.value - b.value
                    );
                    break;
                case 'decreasing':
                    processedData.sort((a: any, b: any) =>
                        b.secondary !== undefined ? b.secondary - a.secondary : b.value - a.value
                    );
                    break;
            }
        }
        

        return [{
            label: `${chart.yParameter} vs ${chart.xParameter}`,
            data: processedData,
            color: chart.color,
        }];
    }, [fileData, chart.xParameter, chart.yParameter, chart.color, timeScale, chart.chartType, chart.dateFilterType, chart.numberFilterType]);

    // Render chart content based on type and data
    const renderChartContent = () => {
        if (!fileData || fileData.length === 0) {
            return <EmptyStateDisplay
                
                title="No Data Available"
                message="Upload data to see visualization"
            />;
        }

        if (!chart.chartType) {
            return <EmptyStateDisplay
                title="Select Chart Type"
                message="Configure your visualization to begin"
            />;
        }

        if (!chart.xParameter || !chart.yParameter) {
            return <EmptyStateDisplay
                title="Select Parameters"
                message="Choose X and Y parameters to visualize"
            />;
        }

        const chartDataItem = chartData[0];

        if (!chartDataItem || !chartDataItem.data) {
            return <EmptyStateDisplay
                title="Insufficient Data"
                message="Not enough data to visualize"
            />;
        }

        

        switch (chart.chartType) {
            case 'bar':
                return (
                    <BarChartComponent
                        data={chartDataItem.data}
                        xParameter={chart.xParameter}
                        yParameter={chart.yParameter}
                        color={chart.color}
                    />
                );
                
            case 'line':
                return (
                    <LineChartComponent
                        data={chartDataItem.data}
                        xParameter={chart.xParameter}
                        yParameter={chart.yParameter}
                        color={chart.color}
                        isDateField={isDateField}
                        timeScale={timeScale}
                    />
                );

            case 'area':
                return (
                    <AreaChartComponent
                        data={chartDataItem.data}
                        xParameter={chart.xParameter}
                        yParameter={chart.yParameter}
                        color={chart.color}
                        isDateField={isDateField}
                        timeScale={timeScale}
                    />
                );

            case 'pie':
                return (
                    <PieChartComponent
                        data={chartDataItem.data}
                        yParameter={chart.yParameter}
                    />
                );

            case 'radial':
                return (
                    <RadialBarChartComponent
                        data={chartDataItem.data}
                        yParameter={chart.yParameter}
                    />
                );

            case 'radar':
                return (
                    <RadarChartComponent 
                        data={chartDataItem.data} 
                    />
                );

            case 'funnel':
                return (
                    <FunnelChartComponent
                        data={chartDataItem.data}
                        xParameter={chart.xParameter}
                        yParameter={chart.yParameter}
                    />
                );

            default:
                return (
                    <EmptyStateDisplay
                        title="Unsupported Chart Type"
                        message="Please select a different chart type"
                    />
                );
        }
    };

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
                {renderChartContent()}
            </div>
        </motion.div>
    );
};