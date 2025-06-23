const API_URL = "https://jsonplaceholder.typicode.com/todos";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority?: "text" | "background" | "modalBackground" | "selectorBackground" | "primary" | "secondary" | "inputBackground" | "border" | "danger" | "completedText" | "urgent" | "important" | "remember" | "no-urgency";
  type?: string;
  dueDate?: string; 
  details?: string;
  relatedTasks?: number[];
}

export const fetchInitialTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}?_limit=5`);
    const data = await response.json();
    return data.map((task: any) => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      priority: 'no-urgency', 
      type: 'others',       
      dueDate: undefined,    
      details: undefined,    
      relatedTasks: undefined
    }));
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return [];
  }
};