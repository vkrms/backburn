import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskContext } from '../context/TaskContext';
import { useSettingsContext } from '../context/SettingsContext';
import { addDays, format, setHours, setMinutes } from 'date-fns';
import TaskCard from '../components/TaskCard';
import { CalendarClock, Clock } from 'lucide-react';

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

const Home = () => {
  const { addTask, tasks } = useTaskContext();
  const { settings } = useSettingsContext();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(() => getRandomDueDate(settings));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasAdded, setWasAdded] = useState(false);

  const regenerateDate = () => {
    setDueDate(getRandomDueDate(settings));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addTask(title, description, dueDate);
      setTitle('');
      setDescription('');
      setDueDate(getRandomDueDate(settings));
      setWasAdded(true);
      
      setTimeout(() => {
        setWasAdded(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Smart Postpone</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="What do you want to postpone?"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Add more details..."
                rows={3}
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Random Due Date
                </label>
                <button
                  type="button"
                  onClick={regenerateDate}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <Clock size={16} />
                  Regenerate
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarClock size={20} className="text-indigo-500" />
                  <span className="font-medium">
                    {format(dueDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={20} className="text-indigo-500" />
                  <span className="font-medium">
                    {format(dueDate, 'h:mm a')}
                  </span>
                </div>
              </div>
            </div>
            
            <motion.button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors"
              disabled={isSubmitting || !title.trim()}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Postponing...' : 'Postpone It'}
            </motion.button>
          </form>
        </div>
      </div>
      
      {wasAdded && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded"
        >
          Task has been successfully postponed!
        </motion.div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Postponed</h2>
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.slice(0, 3).map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No tasks have been postponed yet.</p>
        )}
      </div>
    </motion.div>
  );
};

export default Home;