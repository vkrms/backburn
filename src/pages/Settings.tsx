import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsContext } from '../context/SettingsContext';
import { Save, RefreshCw, Calendar, Clock } from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings, loading } = useSettingsContext();
  
  const [minDaysAhead, setMinDaysAhead] = useState(settings.minDaysAhead);
  const [maxDaysAhead, setMaxDaysAhead] = useState(settings.maxDaysAhead);
  const [earliestHour, setEarliestHour] = useState(settings.earliestHour);
  const [latestHour, setLatestHour] = useState(settings.latestHour);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (minDaysAhead > maxDaysAhead) {
      alert('Minimum days ahead cannot be greater than maximum days ahead');
      return;
    }
    
    if (earliestHour > latestHour) {
      alert('Earliest hour cannot be greater than latest hour');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateSettings({
        minDaysAhead,
        maxDaysAhead,
        earliestHour,
        latestHour
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetToDefaults = () => {
    setMinDaysAhead(1);
    setMaxDaysAhead(4);
    setEarliestHour(8);
    setLatestHour(23);
  };
  
  // Format hours for display (convert 24h to 12h format)
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-lg font-medium text-gray-800 mb-4">
                  <Calendar size={20} className="text-indigo-500" />
                  Date Range Settings
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="minDaysAhead" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Days Ahead
                    </label>
                    <input
                      type="number"
                      id="minDaysAhead"
                      min="1"
                      max="30"
                      value={minDaysAhead}
                      onChange={(e) => setMinDaysAhead(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Earliest is tomorrow (1 day)
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="maxDaysAhead" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Days Ahead
                    </label>
                    <input
                      type="number"
                      id="maxDaysAhead"
                      min={minDaysAhead}
                      max="30"
                      value={maxDaysAhead}
                      onChange={(e) => setMaxDaysAhead(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Must be greater than or equal to minimum days
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-lg font-medium text-gray-800 mb-4">
                  <Clock size={20} className="text-indigo-500" />
                  Time Range Settings
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label htmlFor="earliestHour" className="block text-sm font-medium text-gray-700 mb-1">
                      Earliest Hour
                    </label>
                    <input
                      type="range"
                      id="earliestHour"
                      min="0"
                      max="23"
                      value={earliestHour}
                      onChange={(e) => setEarliestHour(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="mt-2 text-sm font-medium text-center">
                      {formatHour(earliestHour)}
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="latestHour" className="block text-sm font-medium text-gray-700 mb-1">
                      Latest Hour
                    </label>
                    <input
                      type="range"
                      id="latestHour"
                      min={earliestHour}
                      max="23"
                      value={latestHour}
                      onChange={(e) => setLatestHour(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="mt-2 text-sm font-medium text-center">
                      {formatHour(latestHour)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Random times will be generated between {formatHour(earliestHour)} and {formatHour(latestHour)}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <motion.button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow flex items-center justify-center gap-2 transition-colors"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={18} />
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={resetToDefaults}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw size={18} />
                  Reset to Defaults
                </motion.button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded"
        >
          Settings have been successfully updated!
        </motion.div>
      )}
    </motion.div>
  );
};

export default Settings;