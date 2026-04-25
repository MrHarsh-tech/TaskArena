import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All Difficulties' },
  { value: 'EASY', label: 'Easy', color: '#22C55E' },
  { value: 'MEDIUM', label: 'Medium', color: '#F97316' },
  { value: 'HARD', label: 'Hard', color: '#EF4444' },
];

function CustomSelect({ options, value, onChange, getLabel, getValue, colorKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => getValue(o) === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 bg-[#0B0F1A] border border-[rgba(255,255,255,0.12)] rounded-xl font-medium text-white text-left flex items-center justify-between transition-all hover:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span style={selected?.color ? { color: selected.color } : {}}>
          {selected ? getLabel(selected) : options[0] ? getLabel(options[0]) : ''}
        </span>
        <svg className={`w-4 h-4 text-zinc-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[#0B0F1A] border border-[rgba(255,255,255,0.12)] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          {options.map(opt => (
            <button
              key={getValue(opt)}
              type="button"
              onClick={() => { onChange(getValue(opt)); setOpen(false); }}
              className={`w-full px-4 py-3 text-left font-medium hover:bg-indigo-600/20 transition-colors flex items-center gap-2 ${
                getValue(opt) === value ? 'bg-indigo-600/30 text-white' : 'text-zinc-200'
              }`}
            >
              {colorKey && opt[colorKey] && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt[colorKey] }}></span>}
              {getLabel(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Challenges() {
  const { user } = useContext(AuthContext);
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // challenge to confirm-delete
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (e, challenge) => {
    e.preventDefault();
    setDeleteTarget(challenge);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.delete(`${API_URL}/challenges/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChallenges(prev => prev.filter(c => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete challenge', error);
      alert(error.response?.data?.message || 'Failed to delete challenge.');
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = (challenge) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return challenge.creator?._id === user._id || challenge.creator === user._id;
  };

  return (
    <>
      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-rose-500/30 shadow-[0_0_60px_rgba(244,63,94,0.25)] animate-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Delete Challenge?</h2>
                <p className="text-zinc-400 text-sm mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-zinc-300 mb-8">
              Are you sure you want to delete <span className="font-bold text-white">&ldquo;{deleteTarget.title}&rdquo;</span>? It will be removed from the public list immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" /></svg> Deleting…</>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <CustomSelect
            options={[{ _id: '', name: 'All Categories' }, ...categories]}
            value={categoryFilter}
            onChange={setCategoryFilter}
            getLabel={(o) => o.name}
            getValue={(o) => o._id}
          />
        </div>
        <div className="w-full sm:w-48">
          <CustomSelect
            options={DIFFICULTY_OPTIONS}
            value={difficultyFilter}
            onChange={setDifficultyFilter}
            getLabel={(o) => o.label}
            getValue={(o) => o.value}
            colorKey="color"
          />
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
                    <div className="ml-auto flex items-center gap-2">
                      <button 
                         onClick={(e) => toggleBookmark(e, challenge._id)}
                         className={`p-2 rounded-full border border-[rgba(255,255,255,0.08)] focus:outline-none transition-all ${bookmarkedIds.includes(challenge._id) ? 'text-rose-500 bg-rose-500/10 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-zinc-400 bg-white/5 hover:bg-white/10 hover:text-rose-400 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]'}`}
                         title="Bookmark Challenge"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {canDelete(challenge) && (
                        <button
                          onClick={(e) => handleDeleteClick(e, challenge)}
                          className="p-2 rounded-full border border-[rgba(255,255,255,0.08)] text-zinc-400 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40 hover:shadow-[0_0_12px_rgba(244,63,94,0.35)] focus:outline-none transition-all"
                          title="Delete Challenge"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
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
