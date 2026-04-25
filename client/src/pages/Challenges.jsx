import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Challenges() {
  const { user } = useContext(AuthContext);
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_URL}/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        let url = `${API_URL}/challenges?`;
        if (searchTerm) url += `search=${searchTerm}&`;
        if (difficultyFilter) url += `difficulty=${difficultyFilter}&`;
        if (categoryFilter) url += `categoryId=${categoryFilter}&`;
        
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setChallenges(res.data);

        // Fetch bookmarks if logged in
        if (user) {
          const bms = await axios.get(`${API_URL}/bookmarks/statuses`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBookmarkedIds(bms.data);
        }
      } catch (error) {
        console.error('Failed to fetch challenges', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a slight debounce for searching
    const timeoutId = setTimeout(() => fetchChallenges(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, difficultyFilter, categoryFilter, user]);

  const toggleBookmark = async (e, challengeId) => {
    e.preventDefault(); // Prevent link click
    if (!user) {
       alert("Please log in to bookmark challenges.");
       return;
    }
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const res = await axios.post(`${API_URL}/bookmarks/${challengeId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.isBookmarked) {
        setBookmarkedIds(prev => [...prev, challengeId]);
      } else {
        setBookmarkedIds(prev => prev.filter(id => id !== challengeId));
      }
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
    }
  };

  return (
    <>
      <div className="cosmic-dashboard-bg">
        <div className="cosmic-stars"></div>
        <div className="cosmic-nebula"></div>
        <div className="cosmic-planet-1"></div>
        <div className="cosmic-planet-2"></div>
      </div>
      <div className="space-y-8 max-w-7xl mx-auto animate-in relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl font-black text-white tracking-tight mb-2">Available Challenges</h1>
          <p className="text-lg text-zinc-400">Test your skills and climb the leaderboard.</p>
        </div>
        {user?.role === 'INSTRUCTOR' && (
          <Link 
            to="/challenges/create" 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-500 hover:scale-105 transition-all w-full md:w-auto text-center"
          >
            + Create Challenge
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 glass-panel solid-graph-bg p-4">
        <div className="flex-grow">
          <input 
            type="text" 
            placeholder="Search challenges by title or topic..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/5 text-white placeholder-zinc-500 transition-all font-medium"
          />
        </div>
        <div className="w-full sm:w-48">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/5 text-white transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#1c1e2a] text-white">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id} className="bg-[#1c1e2a] text-white">{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-48">
          <select 
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/5 text-white transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#1c1e2a] text-white">All Difficulties</option>
            <option value="EASY" className="bg-[#1c1e2a] text-white">Easy</option>
            <option value="MEDIUM" className="bg-[#1c1e2a] text-white">Medium</option>
            <option value="HARD" className="bg-[#1c1e2a] text-white">Hard</option>
          </select>
        </div>
      </div>

      {loading && challenges.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(n => <div key={n} className="bg-white/5 h-64 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {challenges.map(challenge => (
            <div key={challenge._id} className="group glass-panel solid-graph-bg hover:scale-[1.03] hover:shadow-[0_10px_40px_rgba(99,102,241,0.25)] hover:border-indigo-500/50 transition-all duration-300 flex flex-col overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-full h-1 ${challenge.difficulty === 'EASY' ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : challenge.difficulty === 'MEDIUM' ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`}></div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4 mt-2">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${challenge.difficulty === 'EASY' ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.2)]' : challenge.difficulty === 'MEDIUM' ? 'bg-[rgba(249,115,22,0.15)] text-[#F97316] shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.2)]'}`}>
                    {challenge.difficulty}
                  </span>
                  {challenge.creator && (
                    <span className="text-sm font-medium text-zinc-400 flex items-center gap-1.5">
                       <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
                         {challenge.creator.avatarUrl ? <img src={challenge.creator.avatarUrl} className="w-full h-full rounded-full" /> : challenge.creator.name?.charAt(0)}
                       </div>
                       {challenge.creator.name}
                    </span>
                  )}
                  {user && (
                    <button 
                       onClick={(e) => toggleBookmark(e, challenge._id)}
                       className={`ml-auto p-2 rounded-full border border-[rgba(255,255,255,0.08)] focus:outline-none transition-all ${bookmarkedIds.includes(challenge._id) ? 'text-rose-500 bg-rose-500/10 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-zinc-400 bg-white/5 hover:bg-white/10 hover:text-rose-400 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]'}`}
                       title="Bookmark Challenge"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <h3 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-fuchsia-400 transition-all duration-300">
                  {challenge.title}
                </h3>
                <p className="text-zinc-400 flex-grow mb-8 line-clamp-3 leading-relaxed">
                  {challenge.description}
                </p>
                
                <div className="mt-auto">
                  <Link 
                    to={`/challenges/${challenge._id}`}
                    className="block w-full text-center bg-gradient-primary text-white py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:-translate-y-0.5"
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
              <h3 className="text-2xl font-bold text-white">No challenges found</h3>
              <p className="text-zinc-400 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
