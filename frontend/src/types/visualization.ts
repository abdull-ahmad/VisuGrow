import GridLayout , {  Layout } from 'react-grid-layout';

export interface ChartCanvasProps {
  canvases: CanvasConfig[];
  selectedCanvasId: string;
  onCanvasSelect: (id: string) => void;
  onAddCanvas: () => void;
  onLayoutChange: (canvasId: string, newLayout: GridLayout.Layout[]) => void;
  onRemoveChart: (chartId: string) => void;
  onDeleteCanvas: (canvasId: string) => void;
  onSelectChart: (chartId: string) => void;
  onAddTextBox: (canvasId: string, textBox: TextBoxItem) => void;
  onUpdateTextBox: (canvasId: string, textBoxId: string, updates: any) => void;
  onRemoveTextBox: (canvasId: string, textBoxId: string) => void;
}

export interface VisualizationPanelProps {
  charts: ChartConfig[];
  addChart: (chart: ChartConfig) => void;
  updateChart: (id: string, updatedChart: Partial<ChartConfig>) => void;
  onRemoveChart: (chartId: string) => void;
}

export type TimeScale = 'Y' | 'M' | 'W' | 'D';

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'radial' | 'funnel';

export interface ChartConfig {
  id: string;
  chartType: ChartType;
  xParameter: string;
  yParameter: string;
  color?: string;
  dateFilterType?: TimeScale;
  numberFilterType?: 'increasing' | 'decreasing' | null ;
}

export interface TextBoxItem {
  id: string;
  type: 'textbox';
  content: string;
}

export interface CanvasConfig {
  id: string;
  name: string;
  charts: ChartConfig[];
  textBoxes: TextBoxItem[];
  layout?: GridLayout.Layout[];
}

export interface ChartDataItem {
    primary: any;
    secondary: number;
}

export interface PieChartDataItem {
    name: string;
    value: number;
    fill: string;
}

export interface SingleChartProps {
    chart: ChartConfig;
    onSelect: () => void;
    onDelete: () => void;
    onDownload: () => void;
}

export interface VisualizationState {
  // Canvas state
  canvases: CanvasConfig[];
  selectedCanvasId: string;
  selectedChartId: string | null;
  
  // UI state
  rightPanelCollapsed: boolean;
  activeRightTab: 'data' | 'visualize';
  
  // Canvas operations
  addCanvas: () => void;
  deleteCanvas: (canvasId: string) => void;
  setSelectedCanvasId: (id: string) => void;
  
  // Chart operations
  addChart: (chart: ChartConfig) => void;
  updateChart: (id: string, updatedChart: Partial<ChartConfig>) => void;
  removeChart: (id: string) => void;
  setSelectedChartId: (id: string | null) => void;

  addTextBox: (canvasId: string, textBox: any) => void;
  updateTextBox: (canvasId: string, textBoxId: string, updates: any) => void;
  removeTextBox: (canvasId: string, textBoxId: string) => void;

  
  // Layout operations
  handleLayoutChange: (canvasId: string, newLayout: Layout[]) => void;
  
  // UI operations
  toggleRightPanel: () => void;
  setActiveRightTab: (tab: 'data' | 'visualize') => void;

  // reset store
  resetStore: () => void;
}
