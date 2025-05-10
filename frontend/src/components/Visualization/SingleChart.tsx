import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon,
    PieChart as PieChartIcon, Radar as RadarIcon, Activity, TrendingDown,
    Download, Trash2, GripVertical,
    Sparkles,
    // X as CloseIcon, // No longer needed directly here for modal
} from 'lucide-react';
import { useDataSourceStore } from '../../store/dataSourceStore';
import { SingleChartProps, TimeScale } from '../../types/visualization';
import { EmptyStateDisplay } from '../../components/Charts/SkeletonChart';
import { groupDataByTimeScale } from '../../utils/dateScaler';
import { COLORS } from '../../constants/ChartConstants';

// --- IMPORT YOUR SPECIFIC CHART COMPONENTS ---
import { BarChartComponent } from '../Charts/BarChart';
import { LineChartComponent } from '../Charts/LineChart';
import { AreaChartComponent } from '../Charts/AreaChart';
import { PieChartComponent } from '../Charts/PieChart';
// import { RadarChartComponent } from '../Charts/RadarChart';
import { FunnelChartComponent } from '../Charts/FunnelChart';
// import { RadialChartComponent } from '../Charts/RadialChart';

// --- IMPORT NEW MODAL AND DISPLAY COMPONENTS ---
import { AnalysisModal } from '../Modal/AnalysisModal'; // Adjust path as needed
import { TextBox } from '../TextBox';


interface ProcessedChartDataItem {
    name: string;
    primary: string | number | Date;
    secondary: number;
}

interface ChartDataResult {
    data: any | null;
    error?: string;
}


export const SingleChart: React.FC<SingleChartProps> = ({
    chart,
    onSelect,
    onDelete,
    onDownload,
    isDraggable = true,
    onAddTextBoxWithContent,
    onAnalyze
}) => {
    const { sourceData, sourceHeaders } = useDataSourceStore();
    const [timeScale, setTimeScale] = useState<TimeScale | null>(chart.dateFilterType || null);

    // --- State for AI Analysis ---
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [persistedNotes, setPersistedNotes] = useState<
        { id: string; content: string }[]
    >([]); // Store notes


    useEffect(() => {
        setTimeScale(chart.dateFilterType || null);
    }, [chart.dateFilterType]);

    const getParameterType = (paramName: string): string | null => {
        const header = sourceHeaders?.find((h) => h.name === paramName);
        const type = header?.type?.toLowerCase();
        if (type && ['date', 'datetime', 'timestamp', 'datetimeoffset'].includes(type)) return 'date';
        if (type && ['number', 'integer', 'int', 'float', 'double', 'decimal', 'numeric'].includes(type)) return 'number';
        return type || null;
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
    const chartTitleForAnalysis = `${chart.yParameter || 'Y-Axis'} by ${chart.xParameter || 'X-Axis'}`;

    const chartDataResult = useMemo<ChartDataResult>(() => {
        if (!sourceData || sourceData.length === 0) { return { data: null, error: "Data source is empty or not loaded." }; }
        if (!chart.xParameter || !chart.yParameter) { return { data: null, error: "X and Y parameters must be selected." }; }
        if (!sourceHeaders?.some(h => h.name === chart.xParameter) || !sourceHeaders?.some(h => h.name === chart.yParameter)) { return { data: null, error: "Selected parameters not found in the current data source." }; }
        if (['line', 'area'].includes(chart.chartType) && !isYNumericField) { return { data: null, error: `Y-Axis (${chart.yParameter}) must be numeric for ${chart.chartType} charts.` }; }

        try {
            const processData = (): ProcessedChartDataItem[] | any[] => {
                const isLineArea = chart.chartType === 'line' || chart.chartType === 'area';
                const isCategoryAggregate = ['pie', 'radial', 'funnel'].includes(chart.chartType) || (chart.chartType === 'bar' && isYNumericField);
                const isBarCategoryCount = chart.chartType === 'bar' && !isYNumericField;
                const isRadar = chart.chartType === 'radar';
                const currentTimeScale = timeScale;

                const rawData = sourceData.map((item: any) => {
                    let primaryValue: string | number | Date | null = item[chart.xParameter];
                    let secondaryValue: number | string | null = item[chart.yParameter];

                    if (isXDateField && primaryValue) {
                        const date = new Date(primaryValue);
                        primaryValue = isNaN(date.getTime()) ? null : date;
                    } else if (primaryValue === null || primaryValue === undefined) {
                        primaryValue = null;
                    }

                    if (isYNumericField) {
                        const num = parseFloat(secondaryValue as string);
                        secondaryValue = isNaN(num) ? 0 : num;
                    } else if (isCategoryAggregate || isRadar || isBarCategoryCount) {
                        if (isBarCategoryCount) {
                            secondaryValue = secondaryValue?.toString() ?? 'undefined';
                        } else {
                            const num = parseFloat(secondaryValue as string);
                            secondaryValue = isNaN(num) ? 0 : num;
                        }
                    } else {
                        secondaryValue = null;
                    }
                    return { primary: primaryValue, secondary: secondaryValue };
                }).filter(item => item.primary !== null && item.primary !== undefined && item.secondary !== null && item.secondary !== undefined);

                if (rawData.length === 0) return [];

                if (isLineArea && isXDateField && currentTimeScale) {
                    const numericData = rawData.filter(d => typeof d.secondary === 'number') as ProcessedChartDataItem[];
                    return groupDataByTimeScale(numericData, currentTimeScale);
                } else if (isCategoryAggregate) {
                    const numericData = rawData.map(d => ({ ...d, secondary: typeof d.secondary === 'number' ? d.secondary : 0 }));
                    const categoryMap = aggregateByCategory(numericData);
                    let result = Object.entries(categoryMap).map(([category, value], index) => ({
                        name: category, value: value, primary: category, secondary: value,
                        fill: COLORS[index % COLORS.length]
                    }));
                    if (chart.chartType === 'funnel') { result = result.sort((a, b) => b.value - a.value); }
                    return result;
                } else if (isBarCategoryCount) {
                    const categoryMap = countByCategory(rawData);
                    return Object.entries(categoryMap).map(([category, value], index) => ({
                        name: category, value: value, primary: category, secondary: value,
                        fill: COLORS[index % COLORS.length]
                    }));
                } else if (isRadar) {
                    return processRadarData(rawData);
                } else {
                    return rawData.map(d => ({
                        primary: d.primary,
                        secondary: typeof d.secondary === 'number' ? d.secondary : 0
                    })) as ProcessedChartDataItem[];
                }
            };

            const aggregateByCategory = (data: { primary: any; secondary: number }[]): Record<string | number, number> => {
                return data.reduce((acc: Record<string | number, number>, item) => {
                    const key = item.primary?.toString() ?? 'undefined';
                    acc[key] = (acc[key] || 0) + item.secondary;
                    return acc;
                }, {});
            };

            const countByCategory = (data: { primary: any; secondary: string }[]): Record<string | number, number> => {
                return data.reduce((acc: Record<string | number, number>, item) => {
                    const key = item.primary?.toString() ?? 'undefined';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
            };

            const processRadarData = (data: { primary: any; secondary: any }[]): any => {
                console.warn(`[Chart ${chart.id}] Radar processing needs specific implementation.`);
                const categoryMap = aggregateByCategory(data.map(d => ({ ...d, secondary: typeof d.secondary === 'number' ? d.secondary : 0 })));
                const fullMarkValue = Object.values(categoryMap).length > 0 ? Math.max(...Object.values(categoryMap)) * 1.1 : 100;
                return Object.entries(categoryMap).map(([subject, value]) => ({ subject, value, fullMark: fullMarkValue }));
            };

            let processedData = processData();

            if (chart.numberFilterType && Array.isArray(processedData) && processedData.length > 0) {
                const sortKey = processedData[0].secondary !== undefined ? 'secondary' : (processedData[0].value !== undefined ? 'value' : null);
                if (sortKey) {
                    processedData.sort((a, b) => {
                        const valA = a[sortKey]; const valB = b[sortKey];
                        if (typeof valA === 'number' && typeof valB === 'number') {
                            return chart.numberFilterType === 'increasing' ? valA - valB : valB - valA;
                        } return 0;
                    });
                }
            }
            return { data: processedData };
        } catch (error: any) {
            console.error(`[Chart ${chart.id}] Error processing chart data:`, error);
            return { data: null, error: `Processing Error: ${error.message || 'Unknown error'}` };
        }
    }, [
        sourceData,
        sourceHeaders,
        chart.xParameter,
        chart.yParameter,
        chart.color,
        timeScale,
        chart.chartType,
        chart.dateFilterType,
        chart.numberFilterType,
        isXDateField,
        isYNumericField,
    ]);

    // --- AI Analysis Handler ---
    const handleAiAnalysis = async () => {
        if (!chartDataResult.data || (Array.isArray(chartDataResult.data) && chartDataResult.data.length === 0)) {
            onAnalyze("No data available for analysis.", chartTitleForAnalysis);
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null); // Clear previous results

        let dataPayload: ProcessedChartDataItem[] | null = chartDataResult.data;

        if (Array.isArray(chartDataResult.data)) {
            const transformedData = chartDataResult.data.map((item) => {
                if (typeof item !== 'object' || item === null) return null;
                const name =
                    item.name ??
                    item.subject ??
                    (item.primary !== undefined ? String(item.primary) : undefined);
                const primary = item.primary;
                const secondary = item.secondary ?? item.value;
                if (primary !== undefined && secondary !== undefined) {
                    return { name, primary, secondary };
                }
                return null;
            }).filter((item): item is ProcessedChartDataItem => item !== null); // Type guard
            dataPayload = transformedData;
        }

        try {
            const response = await fetch('http://localhost:5000/api/ai/analyze-chart-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chartType: chart.chartType,
                    xParameter: chart.xParameter,
                    yParameter: chart.yParameter,
                    title: chartTitleForAnalysis,
                    data: dataPayload,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Analysis request failed with status: " + response.status }));
                throw new Error(errorData.message || `Analysis failed: ${response.statusText}`);
            }
            const result = await response.json();
            onAnalyze(result.analysis, "AI Analysis"); // Call the callback with the analysis result
        } catch (error) {
            console.error("AI Analysis error:", error);
            setAnalysisResult(error instanceof Error ? error.message : "An unexpected error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const closeAnalysisModal = () => {
        setIsAnalysisModalOpen(false);
    };

    const handlePersistAnalysis = (text: string) => {
        onAddTextBoxWithContent(text); // Call the callback to add a TextBox
        setIsAnalysisModalOpen(false); // Close the modal
    };

    const handleDeleteNote = (id: string) => {
        setPersistedNotes((prevNotes) => prevNotes.filter((note) => note.id !== id)); // Remove note by ID
    };

    const handleUpdateNote = (id: string, content: string) => {
        setPersistedNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === id ? { ...note, content } : note))
        ); // Update note content
    };

    const renderChartContent = () => {
        if (!sourceData) { return <EmptyStateDisplay title="Load Data" message="Load a data source in the panel." />; }
        if (sourceData.length === 0) { return <EmptyStateDisplay title="Empty Data Source" message="The loaded source has no records." />; }
        if (!chart.chartType) { return <EmptyStateDisplay title="Select Chart Type" message="Choose a visualization type." />; }
        if (!chart.xParameter || !chart.yParameter) { return <EmptyStateDisplay title="Select Parameters" message="Choose X and Y parameters." />; }
        if (chartDataResult.error) { return <EmptyStateDisplay title="Configuration Error" message={chartDataResult.error} />; }

        const processedDataArray = chartDataResult.data;
        const hasData = processedDataArray && (
            (Array.isArray(processedDataArray) && processedDataArray.length > 0) ||
            (chart.chartType === 'radar' && typeof processedDataArray === 'object' && processedDataArray?.length > 0)
        );

        if (!hasData) {
            return <EmptyStateDisplay title="No Data to Display" message="Filters or configuration resulted in no data points." />;
        }

        const commonProps = {
            data: processedDataArray,
            xParameter: chart.xParameter,
            yParameter: chart.yParameter,
            color: chart.color || COLORS[0],
        };

        switch (chart.chartType) {
            case 'bar': return <BarChartComponent {...commonProps} />;
            case 'line': return <LineChartComponent {...commonProps} isDateField={isXDateField} timeScale={timeScale} />;
            case 'area': return <AreaChartComponent {...commonProps} isDateField={isXDateField} timeScale={timeScale} />;
            case 'pie': return <PieChartComponent {...commonProps} />;
            // case 'radar': return <RadarChartComponent data={processedDataArray} /* other props */ />;
            case 'funnel': return <FunnelChartComponent {...commonProps} />;
            // case 'radial': return <RadialChartComponent {...commonProps} />;
            default:
                return <div className="text-xs text-gray-400 flex items-center justify-center h-full">Chart type '{chart.chartType}' component not found.</div>;
        }
    };

    return (
        <>
            <motion.div
                layout
                className="relative h-full w-full overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                id={`chart-${chart.id}`}

            >
                <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between text-gray-600 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium truncate mr-2">
                        {getChartIcon()}
                        <span className="truncate" title={chartTitleForAnalysis}>
                            {chartTitleForAnalysis}
                        </span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {isDraggable && (<button className="drag-handle cursor-move p-1 text-gray-400 hover:text-gray-600" title="Drag Chart"> <GripVertical size={14} /> </button>)}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAiAnalysis(); }}
                            className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Analyze with AI"
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? <Activity size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-1 text-gray-400 hover:text-blue-600" title="Download Chart"> <Download size={14} /> </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-400 hover:text-red-500" title="Delete Chart"> <Trash2 size={14} /> </button>
                    </div>
                </div>

                <div
                    className="flex-grow p-2 h-full w-full cursor-pointer relative" // Added relative for positioning persisted text
                    onClick={onSelect}
                >
                    {renderChartContent()}
                    {persistedNotes.map((note) => (
                        <div className="absolute bottom-2 left-2 right-2 z-10"> {/* Position at bottom */}
                            <TextBox
                                key={note.id}
                                id={note.id}
                                content={note.content}
                                onDelete={() => handleDeleteNote(note.id)}
                                onContentChange={(content) => handleUpdateNote(note.id, content)}
                            />
                        </div>
                    ))}
                </div>
            </motion.div>

            <AnalysisModal
                isOpen={isAnalysisModalOpen}
                isLoading={isAnalyzing}
                analysisText={analysisResult}
                chartTitle={chartTitleForAnalysis}
                onClose={closeAnalysisModal}
                onPersistAnalysis={handlePersistAnalysis}
            />
        </>
    );
};