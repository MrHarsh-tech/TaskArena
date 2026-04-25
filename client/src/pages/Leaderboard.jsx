import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Leaderboard() {
  const { user: currentUser } = useContext(AuthContext);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const res = await axios.get(`${API_URL}/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setLeaders(res.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <>
      <div className="cosmic-dashboard-bg">
        <div className="cosmic-stars"></div>
        <div className="cosmic-nebula"></div>
        <div className="cosmic-planet-1"></div>
        <div className="cosmic-planet-2"></div>
      </div>
      <div className="max-w-4xl mx-auto space-y-8 animate-in relative z-10">
      <div className="text-center">
        <h1 className="font-display text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">Global Leaderboard</h1>
        <p className="text-zinc-400 text-lg">Top 50 most active and skilled users in TaskArena</p>
      </div>

      <div className="glass-panel solid-graph-bg overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4,5].map(n => <div key={n} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-[rgba(255,255,255,0.08)] text-sm font-semibold text-white uppercase tracking-wider">
                <th className="p-4 pl-6 text-center w-16">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4 text-center">Level / XP</th>
                <th className="p-4 text-center hidden md:table-cell">Challenges</th>
                <th className="p-4 text-center hidden sm:table-cell">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {leaders.map((user) => {
                const isCurrentUser = currentUser && currentUser._id === user.userId;
                
                return (
                  <tr 
                    key={user.userId} 
                    className={`group transition-all hover:bg-white/5 hover:scale-[1.01] ${isCurrentUser ? 'bg-indigo-500/10 shadow-[inset_4px_0_0_0_#6366F1]' : ''}`}
                  >
                    <td className="p-4 pl-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 
                        user.rank === 2 ? 'bg-zinc-400/20 text-zinc-300 shadow-[0_0_15px_rgba(161,161,170,0.5)]' :
                        user.rank === 3 ? 'bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]' :
                        'text-zinc-500 bg-white/5'
                      }`}>
                        {user.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/20">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold ${isCurrentUser ? 'text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'text-zinc-100'}`}>
                            {user.name} {isCurrentUser && '(You)'}
                          </p>
                          {user.currentStreak > 2 && (
                            <p className="text-xs text-orange-400 font-medium drop-shadow-[0_0_5px_rgba(249,115,22,0.4)]">🔥 {user.currentStreak} streak</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 mb-1 border border-indigo-500/30">
                        Lvl {user.level}
                      </div>
                      <p className="text-sm font-medium text-zinc-400">{user.xpPoints} XP</p>
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      <span className="font-semibold text-zinc-300">{user.challengesCompleted}</span>
                    </td>
                    <td className="p-4 text-center hidden sm:table-cell">
                      <span className="font-semibold text-emerald-400">{Math.round(user.averageScore)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </>
  );
}
