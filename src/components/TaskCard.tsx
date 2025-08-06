import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { Task, useTaskContext } from '../context/TaskContext';
import { useSettingsContext } from '../context/SettingsContext';
import { Calendar, Clock, CheckCircle, Trash2, RefreshCw, Edit } from 'lucide-react';
import { isToday } from '../utils/dateUtils';
import Modal from './Modal';

interface TaskCardProps {
  task: Task;
}

interface Settings {
  minDaysAhead: number;
  maxDaysAhead: number;
  earliestHour: number;
  latestHour: number;
}

const getRandomDueDate = (settings: Settings): Date => {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleRegenerateDate = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newDate = getRandomDueDate(settings);
    
    // Update local state
    setEditDueDate(newDate);
    
    // If called from outside modal (Postpone further button), save to database immediately
    if (!isModalOpen) {
      setSaving(true);
      try {
        await updateTaskDueDate(task.id, newDate);
      } catch (error) {
        console.error('Error saving date to database:', error);
      }
      setSaving(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    const currentTime = editDueDate;
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    setEditDueDate(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newDate = new Date(editDueDate);
    newDate.setHours(hours, minutes);
    setEditDueDate(newDate);
  };

  const handleDateTimeBlur = async () => {
    // setSaving(true);
    // await updateTaskDueDate(task.id, editDueDate);
    // setSaving(false);
  };

  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
  const isDueToday = !task.completed && isToday(new Date(task.dueDate));

  const handleEdit = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(new Date(task.dueDate));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateTask(task.id, { title: editTitle, description: editDescription });
    await updateTaskDueDate(task.id, editDueDate);
    setSaving(false);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className={`border rounded-lg overflow-hidden shadow-sm transition-all ${
          task.completed
            ? 'bg-gray-50 border-gray-200'
            : isOverdue
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow'
        }`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {isDueToday && (
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" title="Due today"></div>
              )}
              <h3 className={`font-medium ${
                task.completed
                  ? 'text-gray-500 line-through'
                  : isOverdue
                    ? 'text-red-700'
                    : 'text-gray-800'
              }`}>
                {task.title}
              </h3>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <motion.button
                onClick={handleEdit}
                className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                whileTap={{ scale: 0.9 }}
                title="Edit task"
              >
                <Edit size={18} />
              </motion.button>
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
              <motion.button
                onClick={handleRegenerateDate}
                className="flex items-center gap-1.5 text-xs text-red-600 ml-auto hover:bg-red-100 hover:text-red-700 active:bg-red-200 px-2 py-1 rounded transition-all duration-200 hover:shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Regenerate due date"
              >
                <RefreshCw size={14} />
                <span>Postpone further!</span>
              </motion.button>
            )}
          </div>
        </div>
        
        <Modal
          isOpen={isModalOpen}
          onClose={handleCancel}
          title="Edit Task"
          data-test-id="edit-task-modal"
        >
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                disabled={saving}
                required
                maxLength={100}
                autoFocus
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={3}
                disabled={saving}
                placeholder="Add more details..."
                maxLength={500}
              />
            </div>
            
            {/* Due Date Section */}
            <div className="mb-6">
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
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={format(editDueDate, 'yyyy-MM-dd')}
                    onChange={handleDateChange}
                    onBlur={handleDateTimeBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={format(editDueDate, 'HH:mm')}
                    onChange={handleTimeChange}
                    onBlur={handleDateTimeBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    disabled={saving}
                  />
                </div>
              </div>
              
              {/* Preview of the selected date/time */}
              <div className="mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" />
                  <span>{format(editDueDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={14} className="text-indigo-500" />
                  <span>{format(editDueDate, 'h:mm a')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow transition-colors"
                disabled={saving || !editTitle.trim()}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default TaskCard;