import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import TaskList from './pages/TaskList';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <TaskProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tasks" element={<TaskList />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </TaskProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;