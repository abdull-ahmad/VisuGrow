import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon,
    PieChart as PieChartIcon, Radar as RadarIcon, Activity, TrendingDown,
    Download, Trash2, GripVertical,
} from 'lucide-react';
import { useDataSourceStore } from '../../store/dataSourceStore';
import { ChartConfig, TimeScale } from '../../types/visualization';
import { EmptyStateDisplay } from '../../components/Charts/SkeletonChart'; // Corrected import path if needed
import { groupDataByTimeScale } from '../../utils/dateScaler'; // Ensure this path is correct
import { COLORS } from '../../constants/ChartConstants'; // Ensure this path is correct

// --- IMPORT YOUR SPECIFIC CHART COMPONENTS ---
import { BarChartComponent } from '../Charts/BarChart';
import { LineChartComponent } from '../Charts/LineChart';
import { AreaChartComponent } from '../Charts/AreaChart';
import { PieChartComponent } from '../Charts/PieChart';
// import { RadarChartComponent } from '../Charts/RadarChart';
import { FunnelChartComponent } from '../Charts/FunnelChart';
// import { RadialChartComponent } from '../Charts/RadialChart';

// Define expected data item structure after processing for standard charts
interface ProcessedChartDataItem {
  primary: string | number | Date; // Keep Date for grouping, convert to timestamp in specific chart component if needed
  secondary: number;
}

// Define structure for the data passed to the charting library (simplified)
interface ChartDataResult {
    data: any | null; // Can be array or object (for radar)
    error?: string;
}

interface SingleChartProps {
  chart: ChartConfig;
  onSelect: () => void;
  onDelete: () => void;
  onDownload: () => void;
  isDraggable?: boolean;
}

export const SingleChart: React.FC<SingleChartProps> = ({ chart, onSelect, onDelete, onDownload, isDraggable = true }) => {
    const { sourceData, sourceHeaders } = useDataSourceStore();
    const [timeScale, setTimeScale] = useState<TimeScale | null>(chart.dateFilterType || null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setTimeScale(chart.dateFilterType || null);
    }, [chart.dateFilterType]);

    const getParameterType = (paramName: string): string | null => {
        const header = sourceHeaders?.find((h) => h.name === paramName);
        // Match common date/time type names, case-insensitive
        const type = header?.type?.toLowerCase();
        if (type && ['date', 'datetime', 'timestamp', 'datetimeoffset'].includes(type)) return 'date';
        if (type && ['number', 'integer', 'int', 'float', 'double', 'decimal', 'numeric'].includes(type)) return 'number';
        return type || null; // Return 'string', 'boolean', 'text', etc. or null
    };

    const isXDateField = getParameterType(chart.xParameter) === 'date';
    const isYNumericField = getParameterType(chart.yParameter) === 'number';

     const getChartIcon = () => {
        switch (chart.chartType) {
            case 'bar': return <BarChart3 size={16} />;
            case 'line': return <LineChartIcon size={16} />;
            case 'area': return <AreaChartIcon size={16} />;
            case 'pie': return <PieChartIcon size={16} />;
            case 'radar': return <RadarIcon size={16} />;
            case 'radial': return <Activity size={16} />;
            case 'funnel': return <TrendingDown size={16} />;
            default: return <BarChart3 size={16} />;
        }
    };

    // --- Process Chart Data ---
    const chartDataResult = useMemo<ChartDataResult>(() => {
        // --- Start of Data Processing ---
        if (!sourceData || sourceData.length === 0) { return { data: null, error: "Data source is empty or not loaded." }; }
        if (!chart.xParameter || !chart.yParameter) { return { data: null, error: "X and Y parameters must be selected." }; }
        if (!sourceHeaders?.some(h => h.name === chart.xParameter) || !sourceHeaders?.some(h => h.name === chart.yParameter)) { return { data: null, error: "Selected parameters not found in the current data source." }; }
        // Allow non-numeric Y for category aggregation charts (like Pie, Bar counting categories)
        if (['line', 'area'].includes(chart.chartType) && !isYNumericField) { return { data: null, error: `Y-Axis (${chart.yParameter}) must be numeric for ${chart.chartType} charts.` }; }

        console.log(`[Chart ${chart.id}] Processing Start: X=${chart.xParameter}(${getParameterType(chart.xParameter)}), Y=${chart.yParameter}(${getParameterType(chart.yParameter)}), Type=${chart.chartType}, DateFilter=${timeScale}, NumFilter=${chart.numberFilterType}`);

        try {
            const processData = (): ProcessedChartDataItem[] | any[] => {
                 const isLineArea = chart.chartType === 'line' || chart.chartType === 'area';
                 // Bar can be category aggregate (X=category, Y=numeric) or just map (X=category, Y=category -> count)
                 // Pie/Radial/Funnel are typically category aggregate (X=category, Y=numeric)
                 const isCategoryAggregate = ['pie', 'radial', 'funnel'].includes(chart.chartType) || (chart.chartType === 'bar' && isYNumericField);
                 const isBarCategoryCount = chart.chartType === 'bar' && !isYNumericField; // Bar chart counting occurrences of Y category
                 const isRadar = chart.chartType === 'radar';
                 const currentTimeScale = timeScale;

                 console.log(`[Chart ${chart.id}] Mapping raw data...`);
                 const rawData = sourceData.map((item: any, index: number) => {
                     const rawPrimary = item[chart.xParameter];
                     const rawSecondary = item[chart.yParameter];
                     let primaryValue: string | number | Date | null = rawPrimary;
                     let secondaryValue: number | string | null = rawSecondary; // Keep original type initially

                     // --- Primary (X-Axis) Processing ---
                     if (isXDateField && primaryValue) {
                         const date = new Date(primaryValue);
                         if (isNaN(date.getTime())) {
                             if (index < 5) console.warn(`[Chart ${chart.id}] Failed to parse date for X-axis item ${index}:`, rawPrimary);
                             primaryValue = null;
                         } else {
                             primaryValue = date; // Keep as Date object for grouping/scaling
                         }
                     } else if (primaryValue === null || primaryValue === undefined) {
                         primaryValue = null; // Ensure null if explicitly null/undefined
                     } else {
                         primaryValue = primaryValue; // Keep as is (string, number, etc.)
                     }

                     // --- Secondary (Y-Axis) Processing ---
                     if (isYNumericField) { // If header type is numeric
                         const num = parseFloat(secondaryValue as string);
                         if (isNaN(num)) {
                             if (index < 5) console.warn(`[Chart ${chart.id}] Failed to parse number for Y-axis item ${index}:`, rawSecondary);
                             secondaryValue = 0; // Default to 0 if invalid
                         } else {
                             secondaryValue = num;
                         }
                     } else if (isCategoryAggregate || isRadar || isBarCategoryCount) {
                         // For aggregation/counting, we still need a value.
                         // If Y is *not* numeric according to headers:
                         // - For Pie/Funnel/Radial/Bar(numeric Y): Try parsing anyway, default to 0 if fails. This supports cases where numeric data is wrongly typed as string.
                         // - For Bar(category Y): Keep the string value for counting later.
                         if (isBarCategoryCount) {
                             secondaryValue = secondaryValue?.toString() ?? 'undefined'; // Keep as string for counting
                         } else {
                             const num = parseFloat(secondaryValue as string);
                             secondaryValue = isNaN(num) ? 0 : num; // Try parse, default 0 for aggregation
                         }
                     } else {
                         // If not numeric and not for aggregation/counting (e.g., Line/Area with non-numeric Y - already blocked by earlier check)
                         secondaryValue = null; // Should not happen due to earlier check
                     }

                     return { primary: primaryValue, secondary: secondaryValue };

                 }).filter((item, index) => {
                     const isValid = item.primary !== null && item.primary !== undefined && item.secondary !== null && item.secondary !== undefined;
                     if (!isValid && index < 5) {
                         console.warn(`[Chart ${chart.id}] Filtering out item ${index}: Primary=${item.primary}, Secondary=${item.secondary}`);
                     }
                     return isValid;
                 });
                 console.log(`[Chart ${chart.id}] Filtered rawData count: ${rawData.length}`, rawData.slice(0, 5));

                 if (rawData.length === 0) return [];

                 // --- Grouping / Aggregation ---
                 if (isLineArea && isXDateField && currentTimeScale) {
                     console.log(`[Chart ${chart.id}] Grouping by time scale: ${currentTimeScale}`);
                     const numericData = rawData.filter(d => typeof d.secondary === 'number') as ProcessedChartDataItem[]; // Should already be numbers
                     const grouped = groupDataByTimeScale(numericData, currentTimeScale);
                     console.log(`[Chart ${chart.id}] Grouped data count: ${grouped.length}`, grouped.slice(0, 5));
                     return grouped;
                 } else if (isCategoryAggregate) {
                     console.log(`[Chart ${chart.id}] Aggregating by category (X-axis)`);
                     // Ensure secondary is number before aggregating
                     const numericData = rawData.map(d => ({...d, secondary: typeof d.secondary === 'number' ? d.secondary : 0}));
                     const categoryMap = aggregateByCategory(numericData);
                     let result = Object.entries(categoryMap).map(([category, value], index) => ({
                         name: category, // For Pie/Funnel etc.
                         value: value,   // For Pie/Funnel etc.
                         primary: category, // For Bar consistency
                         secondary: value,  // For Bar consistency
                         fill: COLORS[index % COLORS.length]
                     }));
                     if (chart.chartType === 'funnel') { result = result.sort((a, b) => b.value - a.value); }
                     console.log(`[Chart ${chart.id}] Aggregated data count: ${result.length}`, result.slice(0, 5));
                     return result;
                 } else if (isBarCategoryCount) {
                     console.log(`[Chart ${chart.id}] Counting by category (Y-axis)`);
                     const categoryMap = countByCategory(rawData); // Count occurrences of Y-axis values grouped by X-axis
                     let result = Object.entries(categoryMap).map(([category, value], index) => ({
                         name: category, value: value, primary: category, secondary: value,
                         fill: COLORS[index % COLORS.length]
                     }));
                      console.log(`[Chart ${chart.id}] Category count data: ${result.length}`, result.slice(0, 5));
                     return result;
                 } else if (isRadar) {
                     console.log(`[Chart ${chart.id}] Processing for Radar`);
                     const radarData = processRadarData(rawData); // Implement this based on RadarChartComponent needs
                     console.log(`[Chart ${chart.id}] Radar processed data:`, radarData);
                     return radarData;
                 } else {
                     // Default case (e.g., Line/Area with non-date X, Bar with numeric Y but no aggregation needed?)
                     // This path might be less common now with specific handlers above.
                     console.log(`[Chart ${chart.id}] Using default processing (mapping primary/secondary)`);
                     const result = rawData.map(d => ({
                         primary: d.primary, // Keep original type (Date, string, number)
                         secondary: typeof d.secondary === 'number' ? d.secondary : 0 // Ensure secondary is number
                     })) as ProcessedChartDataItem[];
                     console.log(`[Chart ${chart.id}] Default processed data count: ${result.length}`, result.slice(0, 5));
                     return result;
                 }
            };

            // --- Helper Aggregation/Counting Functions ---
            const aggregateByCategory = (data: { primary: any; secondary: number }[]): Record<string | number, number> => {
                 return data.reduce((acc: Record<string | number, number>, item) => {
                    const key = item.primary?.toString() ?? 'undefined'; // Group by primary (X-axis)
                    acc[key] = (acc[key] || 0) + item.secondary; // Sum secondary (Y-axis)
                    return acc;
                }, {});
            };

            const countByCategory = (data: { primary: any; secondary: string }[]): Record<string | number, number> => {
                 return data.reduce((acc: Record<string | number, number>, item) => {
                    const key = item.primary?.toString() ?? 'undefined'; // Group by primary (X-axis)
                    acc[key] = (acc[key] || 0) + 1; // Count occurrences for this primary category
                    return acc;
                }, {});
            };

            const processRadarData = (data: { primary: any; secondary: any }[]): any => {
                 // --- !!! Implement Radar Data Processing Logic Here !!! ---
                 // This depends heavily on how your RadarChartComponent expects data.
                 // Example: Aggregate Y values based on X categories.
                 console.warn("[Chart ${chart.id}] Radar processing not fully implemented.");
                 const categoryMap = aggregateByCategory(data.map(d => ({...d, secondary: typeof d.secondary === 'number' ? d.secondary : 0})));
                 // Example structure Recharts Radar might use: [{ subject: 'Math', A: 120, fullMark: 150 }, ...]
                 return Object.entries(categoryMap).map(([subject, value]) => ({ subject, value, fullMark: Math.max(...Object.values(categoryMap)) * 1.1 })); // Adjust structure as needed!
            };

            let processedData = processData();

            // --- Sorting (Number Filtering) ---
            if (chart.numberFilterType && Array.isArray(processedData) && processedData.length > 0) {
                 console.log(`[Chart ${chart.id}] Applying sorting: ${chart.numberFilterType}`);
                 // Determine the key to sort by ('secondary' for bar/line/area, 'value' for pie/funnel etc.)
                 const sortKey = processedData[0].secondary !== undefined ? 'secondary' : (processedData[0].value !== undefined ? 'value' : null);
                 if (sortKey) {
                    processedData.sort((a, b) => {
                        const valA = a[sortKey]; const valB = b[sortKey];
                        if (typeof valA === 'number' && typeof valB === 'number') {
                            return chart.numberFilterType === 'increasing' ? valA - valB : valB - valA;
                        } return 0;
                    });
                    console.log(`[Chart ${chart.id}] Sorted data:`, processedData.slice(0, 5));
                 } else {
                     console.warn(`[Chart ${chart.id}] Could not find sort key ('secondary' or 'value') for sorting.`);
                 }
            }

            // --- Final Formatting (Return structure based on chart type) ---
            console.log(`[Chart ${chart.id}] Final formatting for type: ${chart.chartType}`);
            // Most components now expect the direct array [{primary, secondary}] or [{name, value}] or radar structure
            return { data: processedData }; // Return the processed data directly

        } catch (error: any) {
            console.error(`[Chart ${chart.id}] Error processing chart data:`, error);
            return { data: null, error: `Processing Error: ${error.message || 'Unknown error'}` };
        }
    }, [sourceData, sourceHeaders, chart.xParameter, chart.yParameter, chart.color, timeScale, chart.chartType, chart.dateFilterType, chart.numberFilterType, isXDateField, isYNumericField]); // Dependencies

    // --- Render Chart Content ---
    const renderChartContent = () => {
        // --- Initial Checks ---
        if (!sourceData) { return <EmptyStateDisplay  title="Load Data" message="Load a data source in the panel." />; }
        if (sourceData.length === 0) { return <EmptyStateDisplay  title="Empty Data Source" message="The loaded source has no records." />; }
        if (!chart.chartType) { return <EmptyStateDisplay  title="Select Chart Type" message="Choose a visualization type." />; }
        if (!chart.xParameter || !chart.yParameter) { return <EmptyStateDisplay  title="Select Parameters" message="Choose X and Y parameters." />; }
        if (chartDataResult.error) { return <EmptyStateDisplay title="Configuration Error" message={chartDataResult.error} />; }

        // --- Check Processed Data ---
        const processedDataArray = chartDataResult.data; // This is now the direct array or radar object
        const hasData = processedDataArray && (
            (Array.isArray(processedDataArray) && processedDataArray.length > 0) ||
            // Add specific check for radar if it returns an object
            (chart.chartType === 'radar' && typeof processedDataArray === 'object' && processedDataArray?.data?.length > 0) // Adjust if radar structure is different
        );

        console.log(`[Chart ${chart.id}] Rendering. Has processed data: ${hasData}. Data:`, processedDataArray);

        if (!hasData) {
            console.log(`[Chart ${chart.id}] No data to display after processing.`);
            return <EmptyStateDisplay title="No Data to Display" message="Filters or configuration resulted in no data points." />;
        }

        // --- Prepare Props and Render Specific Chart ---
        const commonProps = {
            data: processedDataArray, // Pass the processed array/object directly
            xParameter: chart.xParameter,
            yParameter: chart.yParameter,
            color: chart.color || COLORS[0],
        };

        switch (chart.chartType) {
            case 'bar':
                // BarChartComponent needs { primary: category, secondary: number }
                // Ensure data matches this format (comes from aggregateByCategory or countByCategory)
                return <BarChartComponent {...commonProps} />;
            case 'line':
                // LineChartComponent needs { primary: Date/string/number, secondary: number }
                // It handles Date -> timestamp conversion internally
                return <LineChartComponent {...commonProps} isDateField={isXDateField} timeScale={timeScale} />;
            case 'area':
                // AreaChartComponent needs { primary: Date/string/number, secondary: number }
                // It handles Date -> timestamp conversion internally
                return <AreaChartComponent {...commonProps} isDateField={isXDateField} timeScale={timeScale} />;
            // --- Add cases for your other imported components ---
            case 'pie':
                // PieChartComponent likely needs { name: ..., value: ... }
                // Ensure data matches (comes from aggregateByCategory)
                return <PieChartComponent {...commonProps} />; // Adjust props if needed
            // case 'radar':
            //     // RadarChartComponent needs its specific structure
            //     // Pass the processed data object directly
            //     return <RadarChartComponent data={processedDataArray} /* other props */ />;
            case 'funnel':
                // FunnelChartComponent likely needs { name: ..., value: ... } (sorted)
                // Ensure data matches (comes from aggregateByCategory + sort)
                return <FunnelChartComponent {...commonProps} />; // Adjust props if needed
            // case 'radial':
            //     // RadialChartComponent likely needs { name: ..., value: ... }
            //     // Ensure data matches (comes from aggregateByCategory)
            //     return <RadialChartComponent {...commonProps} />; // Adjust props if needed
            default:
                return <div className="text-xs text-gray-400 flex items-center justify-center h-full">Chart type '{chart.chartType}' component not found or implemented.</div>;
        }
    };

    // --- Component JSX ---
    return (
        <motion.div
            layout
            className="relative h-full w-full overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col group"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            id={`chart-${chart.id}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Chart Header */}
            <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between text-gray-600 flex-shrink-0">
                 <div className="flex items-center gap-1.5 text-xs font-medium truncate mr-2">
                   {getChartIcon()}
                   <span className="truncate" title={`${chart.yParameter || 'Y'} by ${chart.xParameter || 'X'}`}>
                       {chart.yParameter || '?'} by {chart.xParameter || '?'}
                   </span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                     {isDraggable && ( <button className="drag-handle cursor-move p-1 text-gray-400 hover:text-gray-600" title="Drag Chart"> <GripVertical size={14} /> </button> )}
                    <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-1 text-gray-400 hover:text-blue-600" title="Download Chart"> <Download size={14} /> </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-400 hover:text-red-500" title="Delete Chart"> <Trash2 size={14} /> </button>
                </div>
            </div>

            {/* Chart Content Area */}
            <div
                className="flex-grow p-2 h-full w-full cursor-pointer"
                onClick={onSelect} // Allow selecting the chart by clicking the content area
            >
                {renderChartContent()}
            </div>
        </motion.div>
    );
};