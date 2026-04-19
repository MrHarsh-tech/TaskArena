import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function LearningPaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const res = await axios.get(`${API_URL}/learning-paths`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPaths(res.data);
      } catch (error) {
        console.error('Failed to fetch learning paths', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Learning Paths</h1>
        <p className="text-slate-600 mt-2">Follow curated sequence of challenges to master specific topics.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2].map(n => <div key={n} className="bg-slate-100 h-48 rounded-xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map(path => (
            <div key={path._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="flex items-center space-x-3 text-2xl mb-2">
                <span>{path.iconEmoji}</span>
                <h3 className="font-bold text-slate-900">{path.title}</h3>
              </div>
              <p className="text-slate-600 flex-grow mb-6">{path.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {path.steps?.length || 0} Steps
                </span>
                <Link 
                  to={`/paths/${path._id}`}
                  className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md font-medium hover:bg-indigo-100 transition"
                >
                  Start Path
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
