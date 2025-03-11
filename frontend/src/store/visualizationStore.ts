import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CanvasConfig, ChartConfig } from '../types/visualization';
import { Layout } from 'react-grid-layout';
import { VisualizationState } from '../types/visualization';

interface VisualizationStateData {
  canvases: CanvasConfig[];
  selectedCanvasId: string;
  selectedChartId: string | null;
  rightPanelCollapsed: boolean;
  activeRightTab: 'data' | 'visualize';
}

const initialState : VisualizationStateData  = {
  canvases: [{
    id: 'default',
    name: 'Main Canvas',
    textBoxes: [],
    charts: [],
    layout: []
  }],
  selectedCanvasId: 'default',
  selectedChartId: null,
  rightPanelCollapsed: false,
  activeRightTab: 'data',
};


export const useVisualizationStore = create<VisualizationState>()(
  persist(
    (set, get) => ({

      ...initialState,

      resetStore: () => { 
        const freshState : Partial <VisualizationState> ={
          ...initialState
        };
        set(freshState);
      },

      // Canvas operations
      addCanvas: () => {
        const newCanvas: CanvasConfig = {
          id: Date.now().toString(),
          name: `Canvas ${get().canvases.length + 1}`,
          charts: [],
          textBoxes: [],
          layout: []
        };
        set((state) => ({
          canvases: [...state.canvases, newCanvas],
          selectedCanvasId: newCanvas.id
        }));
      },
      
      deleteCanvas: (canvasId: string) => {
        const { canvases, selectedCanvasId } = get();
        if (canvases.length <= 1) return; // Prevent deleting last canvas
        
        const newCanvases = canvases.filter(c => c.id !== canvasId);
        set({
          canvases: newCanvases,
          selectedCanvasId: selectedCanvasId === canvasId ? newCanvases[0].id : selectedCanvasId
        });
      },
      
      setSelectedCanvasId: (id: string) => set({ selectedCanvasId: id }),

      addTextBox: (canvasId: string, textBox: any) => {
        set((state) => ({
          canvases: state.canvases.map(canvas =>
            canvas.id === canvasId
              ? {
                  ...canvas,
                  textBoxes: [...(canvas.textBoxes || []), textBox],
                  layout: [
                    ...(canvas.layout || []),
                    { i: textBox.id, x: 0, y: Infinity, w: 3, h: 4 } // Add to bottom
                  ]
                }
              : canvas
          )
        }));
      },
      
      updateTextBox: (canvasId: string, textBoxId: string, updates: any) => {
        set((state) => ({
          canvases: state.canvases.map(canvas =>
            canvas.id === canvasId
              ? {
                  ...canvas,
                  textBoxes: (canvas.textBoxes || []).map(textBox =>
                    textBox.id === textBoxId ? { ...textBox, ...updates } : textBox
                  )
                }
              : canvas
          )
        }));
      },
      
      removeTextBox: (canvasId: string, textBoxId: string) => {
        set((state) => ({
          canvases: state.canvases.map(canvas =>
            canvas.id === canvasId
              ? {
                  ...canvas,
                  textBoxes: (canvas.textBoxes || []).filter(textBox => textBox.id !== textBoxId),
                  layout: canvas.layout?.filter(l => l.i !== textBoxId) || []
                }
              : canvas
          )
        }));
      },
      
      // Chart operations
      addChart: (chart: ChartConfig) => {
        set((state) => ({
          canvases: state.canvases.map(canvas =>
            canvas.id === state.selectedCanvasId
              ? { ...canvas, charts: [...canvas.charts, chart] }
              : canvas
          ),
          selectedChartId: chart.id
        }));
      },
      
      updateChart: (id: string, updatedChart: Partial<ChartConfig>) => {
        set((state) => ({
          canvases: state.canvases.map(canvas =>
            canvas.id === state.selectedCanvasId
              ? {
                ...canvas,
                charts: canvas.charts.map(chart =>
                  chart.id === id ? { ...chart, ...updatedChart } : chart
                )
              }
              : canvas
          )
        }));
      },
      
      removeChart: (id: string) => {
        set((state) => ({
          canvases: state.canvases.map(canvas =>
            canvas.id === state.selectedCanvasId
              ? {
                ...canvas,
                charts: canvas.charts.filter(chart => chart.id !== id),
                layout: canvas.layout?.filter(l => l.i !== id) || []
              }
              : canvas
          ),
          selectedChartId: state.selectedChartId === id ? null : state.selectedChartId
        }));
      },
      
      setSelectedChartId: (id: string | null) => set({ selectedChartId: id }),
      
      // Layout operations
      handleLayoutChange: (canvasId: string, newLayout: Layout[]) => {
        set((state) => ({
          canvases: state.canvases.map(canvas =>
            canvas.id === canvasId
              ? { ...canvas, layout: newLayout }
              : canvas
          )
        }));
      },
      
      // UI operations
      toggleRightPanel: () => set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),
      setActiveRightTab: (tab) => set({ activeRightTab: tab }),
    }),
    {
      name: 'visualization-storage',  // Name for localStorage key
      partialize: (state) => ({
        canvases: state.canvases,
        selectedCanvasId: state.selectedCanvasId,
      }),
    }
  )
);