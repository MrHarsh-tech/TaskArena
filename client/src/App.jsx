import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';
import QuickPlay from './pages/QuickPlay';
import LearningPaths from './pages/LearningPaths';
import LearningPathDetail from './pages/LearningPathDetail';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import CreateChallenge from './pages/CreateChallenge';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center text-slate-400 font-medium">Loading Application...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Home />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
            <Route path="/challenges/create" element={<ProtectedRoute><CreateChallenge /></ProtectedRoute>} />
            <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeDetail /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/quick-play" element={<ProtectedRoute><QuickPlay /></ProtectedRoute>} />
            <Route path="/paths" element={<ProtectedRoute><LearningPaths /></ProtectedRoute>} />
            <Route path="/paths/:id" element={<ProtectedRoute><LearningPathDetail /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
