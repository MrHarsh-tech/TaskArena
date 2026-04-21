import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "text-slate-400 hover:text-slate-200 hover:bg-white/5";
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0f]/80 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <span className="text-white font-display font-black text-xl">T</span>
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-fuchsia-400 transition-all">
              Task<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 neon-text-glow">Arena</span>
            </span>
          </Link>
          
          <div className="hidden md:flex space-x-2">
            {user && (
              <>
                <Link to="/" className={`px-4 py-2 rounded-xl font-medium transition-all ${isActive('/')}`}>Dashboard</Link>
                <Link to="/challenges" className={`px-4 py-2 rounded-xl font-medium transition-all ${isActive('/challenges')}`}>Challenges</Link>
                {/* <Link to="/paths" className={`px-4 py-2 rounded-xl font-medium transition-all ${isActive('/paths')}`}>Learning Paths</Link> */}
                <Link to="/leaderboard" className={`px-4 py-2 rounded-xl font-medium transition-all ${isActive('/leaderboard')}`}>Leaderboard</Link>
                <Link to="/quick-play" className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${isActive('/quick-play')}`}>
                  Quick Play <span className="text-lg drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🎲</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-6">
                <div className="hidden sm:flex items-center space-x-3 bg-white/5 rounded-full px-4 py-2 border border-white/10 shadow-inner">
                  <span className="font-bold text-sm text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">Lvl {user.level || 1}</span>
                  <span className="font-bold text-sm text-slate-300">{user.xpPoints || 0} XP</span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-indigo-500/50 flex items-center justify-center text-indigo-300 font-bold overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:ring-2 hover:ring-fuchsia-500/50 hover:ring-offset-2 hover:ring-offset-[#0a0a0f] transition-all">
                      {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-[#11111a]/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/10 py-2 animate-in z-50">
                      <div className="px-5 py-4 border-b border-white/10 mb-2">
                        <p className="text-sm font-bold text-slate-100 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <div className="mt-3 inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {user.role}
                        </div>
                      </div>
                      <Link to="/" className="block px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-indigo-400 font-medium transition-colors" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                      {user.role === 'INSTRUCTOR' && (
                        <Link to="/challenges/create" className="block px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-indigo-400 font-medium transition-colors" onClick={() => setMenuOpen(false)}>Create Challenge</Link>
                      )}
                      <button 
                        onClick={() => { handleLogout(); setMenuOpen(false); }}
                        className="w-full text-left px-5 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 font-medium mt-1 border-t border-white/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="px-5 py-2.5 text-slate-300 font-bold hover:text-white hover:bg-white/5 rounded-xl transition-colors">Login</Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all hover:-translate-y-0.5 border border-white/10">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
