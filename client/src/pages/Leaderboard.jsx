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
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Global Leaderboard</h1>
        <p className="text-slate-600 text-lg">Top 50 most active and skilled users in TaskArena</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4,5].map(n => <div key={n} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6 text-center w-16">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4 text-center">Level / XP</th>
                <th className="p-4 text-center hidden md:table-cell">Challenges</th>
                <th className="p-4 text-center hidden sm:table-cell">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaders.map((user) => {
                const isCurrentUser = currentUser && currentUser._id === user.userId;
                
                return (
                  <tr 
                    key={user.userId} 
                    className={`group transition-all hover:bg-slate-50 ${isCurrentUser ? 'bg-indigo-50/50 hover:bg-indigo-50/80 shadow-[inset_4px_0_0_0_#4f46e5]' : ''}`}
                  >
                    <td className="p-4 pl-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        user.rank === 1 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400' : 
                        user.rank === 2 ? 'bg-slate-200 text-slate-700 ring-2 ring-slate-300' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-300' :
                        'text-slate-500'
                      }`}>
                        {user.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold ${isCurrentUser ? 'text-indigo-700' : 'text-slate-900'}`}>
                            {user.name} {isCurrentUser && '(You)'}
                          </p>
                          {user.currentStreak > 2 && (
                            <p className="text-xs text-orange-500 font-medium">🔥 {user.currentStreak} day streak</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 mb-1">
                        Lvl {user.level}
                      </div>
                      <p className="text-sm font-medium text-slate-600">{user.xpPoints} XP</p>
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      <span className="font-semibold text-slate-700">{user.challengesCompleted}</span>
                    </td>
                    <td className="p-4 text-center hidden sm:table-cell">
                      <span className="font-semibold text-blue-600">{Math.round(user.averageScore)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
