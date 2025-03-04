import React from 'react';
import Bar from '../Charts/Bar';
import Line from '../Charts/Line';
import { useDataStore } from '../../store/dataStore';
import { ChartConfig } from '../../types/Chart';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { ArrowDownToLine, Trash } from 'lucide-react';

export const SingleChart: React.FC<{
    chart: ChartConfig;
    onDownload: () => void;
    onSelect: () => void;
    onDelete: () => void;
}> = ({ chart, onDownload, onSelect, onDelete }) => {

    const { fileData } = useDataStore();

    const chartData = React.useMemo(() => {
        if (!fileData || !chart.xParameter || !chart.yParameter) return [];
        return [
            {
                label: `${chart.yParameter} vs ${chart.xParameter}`,
                data: fileData.map((item: any) => ({
                    primary: item[chart.xParameter],
                    secondary: item[chart.yParameter],
                })),
                color: chart.color,
            },
        ];
    }, [fileData, chart.xParameter, chart.yParameter, chart.color, chart.filter]);
    
    let content;
    if (!fileData || fileData.length === 0) {
        content = <div className="text-gray-500 p-4">No data available</div>;
    } else if (!chart.chartType) {
        content = <div className="text-gray-500 p-4">Select a chart type to begin</div>;
    } else if (!chart.xParameter || !chart.yParameter) {
        content = <div className="text-gray-500 p-4">Select both X and Y parameters</div>;
    } else {
        switch (chart.chartType) {
            case 'bar':
                content = <div className='h-full w-full'> <Bar chartData={chartData} xLabel={chart.xParameter} yLabel={chart.yParameter} /> </div>;
                break;
            case 'line':
                content = <div className='h-full w-full'><Line chartData={chartData} xLabel={chart.xParameter} yLabel={chart.yParameter} /> </div>;
                break;

            default:
                content = <div>Unsupported chart type</div>;
        }
    }

    return (
        <div className="relative h-full w-full p-4 border rounded-lg overflow-hidden"
            id={`chart-${chart.id}`}
            onClick={onSelect}
        >
            <div className="absolute top-1 right-1 flex gap-1">
                <button
                    onClick={onDownload}
                    className="p-1 bg-white rounded "
                    title="Download Chart"
                >
                    <ArrowDownToLine />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1 bg-white rounded text-red-500"
                    title="Delete Chart"
                >
                    <Trash />
                </button>
            </div>
            {content}
        </div>
    );
};