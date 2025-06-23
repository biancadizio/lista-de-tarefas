export interface Task {
    id: number;
    title: string;
    completed: boolean;
    selected?: boolean;
    priority?: "text" | "background" | "modalBackground" | "selectorBackground" | "primary" | "secondary" | "inputBackground" | "border" | "danger" | "completedText" | "urgent" | "important" | "remember" | "no-urgency";
    type?: string;
    dueDate?: string;
    details?: string;
    relatedTasks?: number[];
  }