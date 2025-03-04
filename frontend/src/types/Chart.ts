import GridLayout from 'react-grid-layout';

export interface ChartCanvasProps {
  canvases: CanvasConfig[];
  selectedCanvasId: string;
  onCanvasSelect: (id: string) => void;
  onAddCanvas: () => void;
  onLayoutChange: (canvasId: string, newLayout: GridLayout.Layout[]) => void;
  onRemoveChart: (chartId: string) => void;
  onDeleteCanvas: (canvasId: string) => void;
  onSelectChart: (chartId: string) => void;
}

export interface VisualizationPanelProps {
  charts: ChartConfig[];
  addChart: (chart: ChartConfig) => void;
  updateChart: (id: string, updatedChart: Partial<ChartConfig>) => void;
}

export interface ChartConfig {
  id: string;
  chartType: 'bar' | 'line' | 'area';
  xParameter: string;
  yParameter: string;
  color?: string;
  filter?: {
    field: string;
    operator: '>' | '<' | '=' | '!=';
    value: string;
  };
  // Add to ChartConfig type
  dateInterval?: 'year' | 'month' | 'week' | 'day';
  aggregateType?: 'sum' | 'average' | 'count';
}

export interface CanvasConfig {
  id: string;
  name: string;
  charts: ChartConfig[];
  layout?: GridLayout.Layout[];
}