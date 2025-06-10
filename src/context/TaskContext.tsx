import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './AuthContext';
import { useAuth } from './AuthContext';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  createdAt: Date;
  completed: boolean;
  userId: string;
}

// Interface for Supabase task data
interface SupabaseTaskData {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  created_at: string;
  completed: boolean;
  user_id: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, description: string, dueDate: Date) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  updateTaskDueDate: (id: string, newDueDate: Date) => Promise<void>;
  updateTask: (id: string, updates: { title?: string; description?: string }) => Promise<void>;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const fetchedTasks = data.map((task: SupabaseTaskData) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: new Date(task.due_date),
        createdAt: new Date(task.created_at),
        completed: task.completed,
        userId: task.user_id
      }));

      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string, description: string, dueDate: Date) => {
    if (!user) return;
    try {
      const newTask = {
        title,
        description,
        due_date: dueDate.toISOString(),
        created_at: new Date().toISOString(),
        completed: false,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      const addedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.due_date),
        createdAt: new Date(data.created_at),
        completed: data.completed,
        userId: data.user_id
      };

      setTasks(prevTasks => [...prevTasks, addedTask]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const completeTask = async (id: string) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) {
        console.error("Task not found for completion:", id);
        return;
      }

      const newCompletedStatus = !taskToUpdate.completed;
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompletedStatus })
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, completed: newCompletedStatus } : task
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const updateTaskDueDate = async (id: string, newDueDate: Date) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: newDueDate.toISOString() })
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, dueDate: newDueDate } : task
        )
      );
    } catch (error) {
      console.error('Error updating task due date:', error);
    }
  };

  const updateTask = async (id: string, updates: { title?: string; description?: string }) => {
    try {
      const { error, data } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, deleteTask, completeTask, updateTaskDueDate, updateTask, loading }}>
      {children}
    </TaskContext.Provider>
  );
};