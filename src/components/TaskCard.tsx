import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { Task, useTaskContext } from '../context/TaskContext';
import { useSettingsContext } from '../context/SettingsContext';
import { Calendar, Clock, CheckCircle, Trash2, RefreshCw } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const getRandomDueDate = (settings: any): Date => {
  const { minDaysAhead, maxDaysAhead, earliestHour, latestHour } = settings;
  
  // Random day between minDaysAhead and maxDaysAhead
  const daysAhead = Math.floor(Math.random() * (maxDaysAhead - minDaysAhead + 1)) + minDaysAhead;
  
  // Random hour between earliestHour and latestHour
  const hour = Math.floor(Math.random() * (latestHour - earliestHour + 1)) + earliestHour;
  
  // Random minute (0, 15, 30, or 45)
  const minute = Math.floor(Math.random() * 4) * 15;
  
  const dueDate = addDays(new Date(), daysAhead);
  const dueDateWithTime = setMinutes(setHours(dueDate, hour), minute);
  
  return dueDateWithTime;
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { deleteTask, completeTask, updateTaskDueDate, updateTask } = useTaskContext();
  const { settings } = useSettingsContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState<Date>(new Date(task.dueDate));
  const [saving, setSaving] = useState(false);

  const handleComplete = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    completeTask(task.id);
  };

  const handleDelete = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const handleRegenerateDate = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newDate = getRandomDueDate(settings);
    if (isEditing) {
      setEditDueDate(newDate);
    } else {
      updateTaskDueDate(task.id, newDate);
    }
  };

  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();

  const handleCardClick = (e: React.MouseEvent) => {
    // Only enter edit mode if not clicking on a button
    if ((e.target as HTMLElement).closest('button')) return;
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(new Date(task.dueDate));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateTask(task.id, { title: editTitle, description: editDescription });
    await updateTaskDueDate(task.id, editDueDate);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditing(false);
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden shadow-sm transition-all ${
        task.completed
          ? 'bg-gray-50 border-gray-200'
          : isOverdue
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow'
      }`}
      onClick={handleCardClick}
      style={{ cursor: isEditing ? 'default' : 'pointer' }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          {isEditing ? (
            <form onSubmit={handleSave} className="flex-1">
              <input
                className="w-full font-medium text-gray-800 border-b border-indigo-200 focus:outline-none focus:border-indigo-500 bg-transparent mb-2"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                disabled={saving}
                required
                maxLength={100}
                autoFocus
              />
              <textarea
                className="w-full text-sm text-gray-700 border-b border-indigo-100 focus:outline-none focus:border-indigo-400 bg-transparent mb-2 resize-none"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={3}
                disabled={saving}
                placeholder="Add more details..."
                maxLength={500}
              />
              
              {/* Due Date Section in Edit Mode */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateDate}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    disabled={saving}
                  >
                    <RefreshCw size={16} />
                    Regenerate
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={20} className="text-indigo-500" />
                    <span className="font-medium">
                      {format(editDueDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={20} className="text-indigo-500" />
                    <span className="font-medium">
                      {format(editDueDate, 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1 rounded shadow"
                  disabled={saving || !editTitle.trim()}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <h3 className={`font-medium ${
              task.completed
                ? 'text-gray-500 line-through'
                : isOverdue
                  ? 'text-red-700'
                  : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
          )}
          <div className="flex items-center space-x-2 ml-2">
            <motion.button
              onClick={handleComplete}
              className={`p-1.5 rounded-full transition-colors ${
                task.completed
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              whileTap={{ scale: 0.9 }}
              title={task.completed ? "Mark as incomplete" : "Mark as complete"}
              tabIndex={isEditing ? -1 : 0}
            >
              <CheckCircle size={18} />
            </motion.button>
            <motion.button
              onClick={handleDelete}
              className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
              whileTap={{ scale: 0.9 }}
              title="Delete task"
              tabIndex={isEditing ? -1 : 0}
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        </div>
        {!isEditing && task.description && (
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
            <motion.button
              onClick={handleRegenerateDate}
              className="flex items-center gap-1.5 text-xs text-red-600 ml-auto hover:bg-red-100 hover:text-red-700 active:bg-red-200 px-2 py-1 rounded transition-all duration-200 hover:shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Regenerate due date"
              tabIndex={isEditing ? -1 : 0}
            >
              <RefreshCw size={14} />
              <span>Overdue</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;