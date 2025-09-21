import { create } from 'zustand';

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: Date;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: any;
}

interface WorkflowsState {
  workflows: Workflow[];
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt'>) => void;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  toggleWorkflow: (id: string) => void;
}

export const useWorkflowsStore = create<WorkflowsState>((set) => ({
  workflows: [],
  
  addWorkflow: (workflow) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({ workflows: [...state.workflows, newWorkflow] }));
  },
  
  updateWorkflow: (id, workflow) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...workflow } : w
      ),
    }));
  },
  
  deleteWorkflow: (id) => {
    set((state) => ({ workflows: state.workflows.filter((w) => w.id !== id) }));
  },
  
  toggleWorkflow: (id) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, isActive: !w.isActive } : w
      ),
    }));
  },
}));
