import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './AuthContext';
import { useAuth } from './AuthContext';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  createdAt: Date;
  completed: boolean;
  userId: string;
  tags?: Tag[];
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
  task_tags?: {
    tag_id: string;
    tags: {
      id: string;
      name: string;
      color?: string;
      user_id: string;
    };
  }[];
}

interface TaskContextType {
  tasks: Task[];
  tags: Tag[];
  addTask: (title: string, description: string, dueDate: Date, tags?: string[]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  updateTaskDueDate: (id: string, newDueDate: Date) => Promise<void>;
  updateTask: (id: string, updates: { title?: string; description?: string; tags?: string[] }) => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag | null>;
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
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchTags();
    } else {
      setTasks([]);
      setTags([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_tags(
            tag_id,
            tags(
              id,
              name,
              color,
              user_id
            )
          )
        `)
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
        userId: task.user_id,
        tags: task.task_tags?.map(tt => ({
          id: tt.tags.id,
          name: tt.tags.name,
          color: tt.tags.color,
          userId: tt.tags.user_id
        })) || []
      }));

      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      const fetchedTags = data.map((tag: { id: string; name: string; color?: string; user_id: string }) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        userId: tag.user_id
      }));

      setTags(fetchedTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const addTask = async (title: string, description: string, dueDate: Date, tagNames: string[] = []) => {
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

      // Handle tags if provided
      const taskTags: Tag[] = [];
      if (tagNames.length > 0) {
        for (const tagName of tagNames) {
          // Check if tag exists, create if not
          let tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (!tag) {
            const newTag = await createTag(tagName);
            if (!newTag) continue;
            tag = newTag;
          }
          
          // Link task to tag
          const { error: linkError } = await supabase
            .from('task_tags')
            .insert([{ task_id: data.id, tag_id: tag.id }]);

          if (!linkError) {
            taskTags.push(tag);
          }
        }
      }

      const addedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.due_date),
        createdAt: new Date(data.created_at),
        completed: data.completed,
        userId: data.user_id,
        tags: taskTags
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

  const updateTask = async (id: string, updates: { title?: string; description?: string; tags?: string[] }) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title: updates.title, description: updates.description })
        .eq('id', id);
      
      if (error) throw error;

      // Handle tag updates if provided
      if (updates.tags !== undefined) {
        // Remove existing tags
        await supabase
          .from('task_tags')
          .delete()
          .eq('task_id', id);

        // Add new tags
        const taskTags: Tag[] = [];
        for (const tagName of updates.tags) {
          let tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (!tag) {
            const newTag = await createTag(tagName);
            if (!newTag) continue;
            tag = newTag;
          }
          
          const { error: linkError } = await supabase
            .from('task_tags')
            .insert([{ task_id: id, tag_id: tag.id }]);

          if (!linkError) {
            taskTags.push(tag);
          }
        }

        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === id ? { 
              ...task, 
              title: updates.title ?? task.title,
              description: updates.description ?? task.description,
              tags: taskTags 
            } : task
          )
        );
      } else {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === id ? { 
              ...task, 
              title: updates.title ?? task.title,
              description: updates.description ?? task.description
            } : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const createTag = async (name: string, color?: string): Promise<Tag | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name, color, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const newTag: Tag = {
        id: data.id,
        name: data.name,
        color: data.color,
        userId: data.user_id
      };

      setTags(prevTags => [...prevTags, newTag]);
      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, tags, addTask, deleteTask, completeTask, updateTaskDueDate, updateTask, createTag, loading }}>
      {children}
    </TaskContext.Provider>
  );
};