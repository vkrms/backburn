import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskContext } from '../context/TaskContext';
import { useSettingsContext } from '../context/SettingsContext';
import { addDays, format, setHours, setMinutes } from 'date-fns';
import TaskCard from '../components/TaskCard';
import Card from '../components/Card';
import { CalendarClock, Clock, Tag as TagIcon, X } from 'lucide-react';

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
  const { addTask, tasks, tags } = useTaskContext();
  const { settings } = useSettingsContext();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(() => getRandomDueDate(settings));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasAdded, setWasAdded] = useState(false);

  const regenerateDate = () => {
    setDueDate(getRandomDueDate(settings));
  };

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !selectedTags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())) {
      setSelectedTags([...selectedTags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addTask(title, description, dueDate, selectedTags);
      setTitle('');
      setDescription('');
      setSelectedTags([]);
      setTagInput('');
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
      <Card>
        <div>
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
            
            {/* Tags Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <div className="space-y-2">
                {/* Current tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <TagIcon size={10} className="mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-blue-600"
                          disabled={isSubmitting}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Tag input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Add tags like 'quick' or 'important'"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => tagInput.trim() && addTag(tagInput)}
                    className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    disabled={isSubmitting || !tagInput.trim()}
                  >
                    Add
                  </button>
                </div>
                
                {/* Existing tags suggestions */}
                {tags.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <span>Existing tags: </span>
                    {tags.filter(tag => !selectedTags.includes(tag.name)).slice(0, 5).map((tag, index) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => addTag(tag.name)}
                        className="text-indigo-600 hover:text-indigo-800 mx-1"
                        disabled={isSubmitting}
                      >
                        {tag.name}
                        {index < Math.min(4, tags.filter(t => !selectedTags.includes(t.name)).length - 1) && ','}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
            
            <div className="flex justify-center">
              <motion.button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors max-w-[320px] cursor-pointer"
                disabled={isSubmitting || !title.trim()}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Postponing...' : 'Postpone It'}
              </motion.button>
            </div>
          </form>
        </div>
      </Card>
      
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