import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskContext } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import Card from '../components/Card';
import { ListFilter, Clock, Check, X, Tag as TagIcon, Shuffle } from 'lucide-react';

const TaskList = () => {
  const { tasks, tags, loading } = useTaskContext();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt' | 'random'>('dueDate');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filterStatus === 'pending' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    
    // Tag filter
    if (selectedTags.length > 0) {
      const taskTagNames = task.tags?.map(tag => tag.name) || [];
      return selectedTags.some(tag => taskTagNames.includes(tag));
    }
    
    return true;
  });

  const toggleTagFilter = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  // Simple seeded random number generator
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const handleShuffle = () => {
    setShuffleKey(prev => prev + 1);
  };
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'random') {
      // Create a hash from task ID and use seeded random for consistent ordering
      const hashA = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomA = seededRandom(hashA + shuffleKey);
      const randomB = seededRandom(hashB + shuffleKey);
      return randomA - randomB;
    } else if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Tasks</h1>
      
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <ListFilter size={20} className="text-indigo-500" />
            <h2 className="text-lg font-medium text-gray-800">Filters</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filterStatus === 'all' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                filterStatus === 'pending' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Clock size={14} />
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                filterStatus === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Check size={14} />
              Completed
            </button>
          </div>
        </div>
        
        {/* Tag Filters */}
        {tags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TagIcon size={16} className="text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearTagFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTagFilter(tag.name)}
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                    selectedTags.includes(tag.name)
                      ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <TagIcon size={10} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'createdAt' | 'random')}
            className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="dueDate">Due Date</option>
            <option value="createdAt">Created Date</option>
            <option value="random">Random</option>
          </select>
          {sortBy === 'random' && (
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              title="Re-shuffle random order"
            >
              <Shuffle size={12} />
              {/* <span>Shuffle</span> */}
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : sortedTasks.length > 0 ? (
          <div className="space-y-4">
            {sortedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <X size={40} className="text-gray-400 mb-2" />
            <p className="text-gray-500 mb-1">No tasks found</p>
            <p className="text-sm text-gray-400">
              {filterStatus !== 'all' || selectedTags.length > 0
                ? `Try changing your filters or add new tasks`
                : `Start by postponing some tasks`}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default TaskList;