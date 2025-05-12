import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TaskList from './pages/TaskList';
import Settings from './pages/Settings';
import { TaskProvider } from './context/TaskContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <Router>
      <SettingsProvider>
        <TaskProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </TaskProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;