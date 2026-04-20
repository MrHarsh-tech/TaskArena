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
    return location.pathname === path ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <span className="text-white font-display font-black text-xl">T</span>
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Task<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Arena</span>
            </span>
          </Link>
          
          <div className="hidden md:flex space-x-2">
            {user && (
              <>
                <Link to="/" className={`px-4 py-2 rounded-xl font-medium transition-colors ${isActive('/')}`}>Dashboard</Link>
                <Link to="/challenges" className={`px-4 py-2 rounded-xl font-medium transition-colors ${isActive('/challenges')}`}>Challenges</Link>
                <Link to="/paths" className={`px-4 py-2 rounded-xl font-medium transition-colors ${isActive('/paths')}`}>Learning Paths</Link>
                <Link to="/leaderboard" className={`px-4 py-2 rounded-xl font-medium transition-colors ${isActive('/leaderboard')}`}>Leaderboard</Link>
                <Link to="/quick-play" className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${isActive('/quick-play')}`}>
                  Quick Play <span className="text-lg">🎲</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-6">
                <div className="hidden sm:flex items-center space-x-3 bg-slate-50 rounded-full px-4 py-2 border border-slate-200">
                  <span className="font-bold text-sm text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">Lvl {user.level || 1}</span>
                  <span className="font-bold text-sm text-slate-700">{user.xpPoints || 0} XP</span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden shadow-sm hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all">
                      {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in z-50">
                      <div className="px-4 py-3 border-b border-slate-100 mb-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                          {user.role}
                        </div>
                      </div>
                      <Link to="/" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                      {user.role === 'INSTRUCTOR' && (
                        <Link to="/challenges/create" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium" onClick={() => setMenuOpen(false)}>Create Challenge</Link>
                      )}
                      <button 
                        onClick={() => { handleLogout(); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium mt-1 border-t border-slate-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="px-5 py-2.5 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-colors">Login</Link>
                <Link to="/register" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all hover:-translate-y-0.5">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
