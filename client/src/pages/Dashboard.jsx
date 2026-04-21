import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        // Fetch basic stats
        const resStats = await axios.get(`${API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats(resStats.data.stats);
        setRecentAttempts(resStats.data.recentAttempts);

        // Fetch detailed analytics based on role
        if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') {
          const resAnalyt = await axios.get(`${API_URL}/dashboard/instructor-analytics`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAnalytics(resAnalyt.data);
        } else {
          const resAnalyt = await axios.get(`${API_URL}/dashboard/student-analytics`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAnalytics(resAnalyt.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (authLoading) return <div className="text-center mt-10">Loading auth...</div>;
  if (!user) return <Navigate to="/" />;

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="font-display text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Dashboard</h1>
        <p className="text-slate-400 mt-2 text-lg">Welcome back, <span className="font-bold text-fuchsia-400">{user.name}</span>! {user.role === 'INSTRUCTOR' ? 'Here is how your challenges are performing.' : 'Track your progress and achievements.'}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => <div key={n} className="bg-slate-800/50 h-28 rounded-xl animate-pulse border border-white/5"></div>)}
        </div>
      ) : (
        <>
          {/* Main Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(99,102,241,0.2)] group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/30 transition-colors pointer-events-none"></div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">XP / Level</h3>
              <p className="text-5xl font-black text-indigo-400 tracking-tight drop-shadow-[0_0_10px_rgba(99,102,241,0.4)] relative z-10">{stats?.xpPoints || 0}</p>
              <p className="text-sm font-medium text-slate-500 mt-2 relative z-10">Level {stats?.level || 1}</p>
            </div>
            {user.role !== 'INSTRUCTOR' && (
              <>
                <div className="glass-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/30 transition-colors pointer-events-none"></div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Completed</h3>
                  <p className="text-5xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] relative z-10">{stats?.completedChallenges || 0}</p>
                  <p className="text-sm font-medium text-slate-500 mt-2 relative z-10">{stats?.totalAttempts || 0} total attempts</p>
                </div>
                <div className="glass-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/30 transition-colors pointer-events-none"></div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Avg Score</h3>
                  <p className="text-5xl font-black text-blue-400 tracking-tight drop-shadow-[0_0_10px_rgba(59,130,246,0.4)] relative z-10">{Math.round(stats?.averageScore || 0)}%</p>
                </div>
                <div className="glass-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(249,115,22,0.2)] group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-orange-500/30 transition-colors pointer-events-none"></div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Streak</h3>
                  <p className="text-5xl font-black text-orange-400 tracking-tight drop-shadow-[0_0_10px_rgba(249,115,22,0.4)] relative z-10">{stats?.currentStreak || 0} 🔥</p>
                  <p className="text-sm font-medium text-slate-500 mt-2 relative z-10">Best: {stats?.longestStreak || 0}</p>
                </div>
              </>
            )}
            {user.role === 'INSTRUCTOR' && analytics?.overview && (
              <>
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2 relative z-10">Total Challenges</h3>
                  <p className="text-4xl font-bold text-emerald-400 drop-shadow-md relative z-10">{analytics.overview.totalChallenges}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2 relative z-10">Students Reached</h3>
                  <p className="text-4xl font-bold text-blue-400 drop-shadow-md relative z-10">{analytics.overview.totalStudentsReached}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2 relative z-10">Global Pass Rate</h3>
                  <p className="text-4xl font-bold text-orange-400 drop-shadow-md relative z-10">{analytics.overview.averagePassRate}%</p>
                  <p className="text-sm text-slate-500 mt-1 relative z-10">{analytics.overview.totalAttemptsReceived} attempts</p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Analytics */}
            {user.role !== 'INSTRUCTOR' && analytics?.scoreTrend && (
              <>
                <div className="glass-card p-8 rounded-3xl">
                  <h3 className="font-display text-xl font-extrabold text-white mb-6">Recent Score Trend</h3>
                  {analytics.scoreTrend.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.scoreTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                          <XAxis dataKey="title" tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#475569" tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val} />
                          <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#475569" />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#0f172a'}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-10">No recent data</p>
                  )}
                </div>

                <div className="glass-card p-8 rounded-3xl flex flex-col h-full">
                  <h3 className="font-display text-xl font-extrabold text-white mb-6">Activity (Last 28 Days)</h3>
                  {analytics.weeklyActivity?.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.weeklyActivity} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                          <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} stroke="#475569" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                          <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#475569" />
                          <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} />
                          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                     <p className="text-slate-500 text-center py-10">No recent activity</p>
                  )}
                </div>

                <div className="glass-card p-8 rounded-3xl flex flex-col h-full">
                  <h3 className="font-display text-xl font-extrabold text-white mb-6">Category Mastery</h3>
                  {analytics.categoryPerformance?.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={analytics.categoryPerformance} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="attempts" nameKey="category" label={({category}) => `${category}`}>
                             {analytics.categoryPerformance.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} formatter={(value, name, props) => [`${value} attempts (Avg: ${props.payload.avgScore}%)`, name]} />
                         </PieChart>
                       </ResponsiveContainer>
                    </div>
                  ) : (
                     <p className="text-slate-500 text-center py-10">No recent activity</p>
                  )}
                </div>

                <div className="glass-card p-8 rounded-3xl flex flex-col h-full">
                  <h3 className="font-display text-xl font-extrabold text-white mb-6">Difficulty Breakdown</h3>
                  {analytics.difficultyBreakdown?.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.difficultyBreakdown} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                          <XAxis dataKey="difficulty" tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#475569" />
                          <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#475569" />
                          <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} formatter={(value, name, props) => [`${value} challenges (Avg: ${props.payload.avgScore}%)`, 'Completed']} />
                          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                     <p className="text-slate-500 text-center py-10">No recent activity</p>
                  )}
                </div>
              </>
            )}

            {/* Instructor Analytics */}
            {user.role === 'INSTRUCTOR' && analytics?.challengePerformance && (
               <>
                 <div className="glass-card p-6 rounded-2xl">
                   <h3 className="text-lg font-semibold text-white mb-6">Challenge Overview</h3>
                   <div className="overflow-auto max-h-64">
                     <table className="w-full text-sm text-left text-slate-300">
                       <thead className="text-xs text-slate-400 uppercase bg-white/5 sticky top-0">
                         <tr>
                           <th className="px-4 py-3">Challenge</th>
                           <th className="px-4 py-3">Attempts</th>
                           <th className="px-4 py-3">Pass Rate</th>
                         </tr>
                       </thead>
                       <tbody>
                         {analytics.challengePerformance.map(c => (
                           <tr key={c.id} className="border-b border-white/5">
                             <td className="px-4 py-3 font-medium text-slate-100">{c.title}</td>
                             <td className="px-4 py-3">{c.attempts}</td>
                             <td className="px-4 py-3">
                               <span className={`px-2 py-1 rounded-full text-xs font-bold border ${c.passRate >= 60 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                                 {c.passRate}%
                               </span>
                             </td>
                           </tr>
                         ))}
                         {analytics.challengePerformance.length === 0 && (
                            <tr><td colSpan="3" className="px-4 py-3 text-center text-slate-500">No challenges yet</td></tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>

                 <div className="glass-card p-6 rounded-2xl">
                   <h3 className="text-lg font-semibold text-white mb-6">Score Distribution</h3>
                   {analytics.scoreDistribution?.length > 0 ? (
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={analytics.scoreDistribution.filter(d => d.count > 0)} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="count" nameKey="bucket" label={({bucket, count}) => `${bucket}% (${count})`}>
                             {analytics.scoreDistribution.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} />
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                   ) : (
                     <p className="text-slate-500 text-center py-10">No data available</p>
                   )}
                 </div>

                 <div className="glass-card p-6 rounded-2xl col-span-1 lg:col-span-2">
                   <h3 className="text-lg font-semibold text-white mb-6">30-Day Engagement Timeline</h3>
                   {analytics.engagementTimeline?.length > 0 ? (
                     <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={analytics.engagementTimeline}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                           <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} stroke="#475569" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                           <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#475569" />
                           <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px' }} />
                           <Line type="monotone" dataKey="attempts" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                   ) : (
                     <p className="text-slate-500 text-center py-10">No data available</p>
                   )}
                 </div>
               </>
            )}
          </div>

          {/* Fallback Recent Attempts (For Students) */}
          {user.role !== 'INSTRUCTOR' && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 bg-white/5">
                <h3 className="text-lg font-semibold text-white">Recent Attempts</h3>
              </div>
              <div className="p-0">
                {!loading && recentAttempts.length === 0 ? (
                  <p className="p-6 text-slate-500 text-center">No recent attempts found. Start a challenge!</p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {recentAttempts.map((attempt) => (
                      <li key={attempt._id} className="p-6 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-200">{attempt.challenge?.title || 'Unknown Challenge'}</p>
                            <p className="text-sm text-slate-400 mt-1">
                              Completed on {new Date(attempt.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold drop-shadow-md ${attempt.percentage >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {Math.round(attempt.percentage)}%
                            </p>
                            <p className="text-sm text-slate-500">{attempt.score}/{attempt.totalQuestions} correct</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
