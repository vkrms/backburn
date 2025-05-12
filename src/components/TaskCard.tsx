import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Task, useTaskContext } from '../context/TaskContext';
import { Calendar, Clock, CheckCircle, Trash2, RefreshCw } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { deleteTask, completeTask } = useTaskContext();
  
  const handleComplete = () => {
    completeTask(task.id);
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };
  
  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
  
  return (
    <motion.div 
      className={`border rounded-lg overflow-hidden shadow-sm transition-all ${
        task.completed 
          ? 'bg-gray-50 border-gray-200'
          : isOverdue
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow'
      }`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-medium ${
            task.completed 
              ? 'text-gray-500 line-through' 
              : isOverdue
                ? 'text-red-700'
                : 'text-gray-800'
          }`}>
            {task.title}
          </h3>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleComplete}
              className={`p-1.5 rounded-full transition-colors ${
                task.completed
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              whileTap={{ scale: 0.9 }}
              title={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              <CheckCircle size={18} />
            </motion.button>
            
            <motion.button
              onClick={handleDelete}
              className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
              whileTap={{ scale: 0.9 }}
              title="Delete task"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        </div>
        
        {task.description && (
          <p className={`text-sm mb-3 ${
            task.completed ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
          <div className={`flex items-center gap-1.5 text-xs ${
            task.completed 
              ? 'text-gray-400' 
              : isOverdue
                ? 'text-red-600'
                : 'text-gray-500'
          }`}>
            <Calendar size={14} />
            <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
          </div>
          
          <div className={`flex items-center gap-1.5 text-xs ${
            task.completed 
              ? 'text-gray-400' 
              : isOverdue
                ? 'text-red-600'
                : 'text-gray-500'
          }`}>
            <Clock size={14} />
            <span>{format(new Date(task.dueDate), 'h:mm a')}</span>
          </div>
          
          {task.completed && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 ml-auto">
              <CheckCircle size={14} />
              <span>Completed</span>
            </div>
          )}
          
          {isOverdue && !task.completed && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 ml-auto">
              <RefreshCw size={14} />
              <span>Overdue</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;