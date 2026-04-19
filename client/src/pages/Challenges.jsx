import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Challenges() {
  const { user } = useContext(AuthContext);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        let url = `${API_URL}/challenges?`;
        if (searchTerm) url += `search=${searchTerm}&`;
        if (difficultyFilter) url += `difficulty=${difficultyFilter}&`;
        
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setChallenges(res.data);
      } catch (error) {
        console.error('Failed to fetch challenges', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a slight debounce for searching
    const timeoutId = setTimeout(() => fetchChallenges(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, difficultyFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Available Challenges</h1>
          <p className="text-lg text-slate-600 mt-2">Test your skills and climb the leaderboard.</p>
        </div>
        {user?.role === 'INSTRUCTOR' && (
          <Link 
            to="/challenges/create" 
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-600 hover:scale-105 transition-all w-full md:w-auto text-center"
          >
            + Create Challenge
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex-grow">
          <input 
            type="text" 
            placeholder="Search challenges by title or topic..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-all font-medium"
          />
        </div>
        <div className="w-full sm:w-48">
          <select 
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {loading && challenges.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(n => <div key={n} className="bg-slate-100 h-64 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {challenges.map(challenge => (
            <div key={challenge._id} className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col overflow-hidden">
              <div className={`h-2 ${challenge.difficulty === 'EASY' ? 'bg-emerald-400' : challenge.difficulty === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-500'}`}></div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${challenge.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-700' : challenge.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                    {challenge.difficulty}
                  </span>
                  {challenge.creator && (
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                       <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                         {challenge.creator.avatarUrl ? <img src={challenge.creator.avatarUrl} className="w-full h-full rounded-full" /> : challenge.creator.name?.charAt(0)}
                       </div>
                       {challenge.creator.name}
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {challenge.title}
                </h3>
                <p className="text-slate-600 flex-grow mb-8 line-clamp-3 leading-relaxed">
                  {challenge.description}
                </p>
                
                <div className="mt-auto">
                  <Link 
                    to={`/challenges/${challenge._id}`}
                    className="block w-full text-center bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-indigo-600 py-3 rounded-xl font-bold transition-colors"
                  >
                    Start Challenge
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {!loading && challenges.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="text-6xl mb-4">🏜️</div>
              <h3 className="text-2xl font-bold text-slate-900">No challenges found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
