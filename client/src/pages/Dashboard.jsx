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
        <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-600 mt-2 text-lg">Welcome back, <span className="font-bold text-indigo-600">{user.name}</span>! {user.role === 'INSTRUCTOR' ? 'Here is how your challenges are performing.' : 'Track your progress and achievements.'}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => <div key={n} className="bg-slate-100 h-28 rounded-xl animate-pulse"></div>)}
        </div>
      ) : (
        <>
          {/* Main Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-100 transition-colors"></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">XP / Level</h3>
              <p className="text-5xl font-black text-indigo-600 tracking-tight">{stats?.xpPoints || 0}</p>
              <p className="text-sm font-medium text-slate-400 mt-2">Level {stats?.level || 1}</p>
            </div>
            {user.role !== 'INSTRUCTOR' && (
              <>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors"></div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Completed</h3>
                  <p className="text-5xl font-black text-emerald-600 tracking-tight">{stats?.completedChallenges || 0}</p>
                  <p className="text-sm font-medium text-slate-400 mt-2">{stats?.totalAttempts || 0} total attempts</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors"></div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Avg Score</h3>
                  <p className="text-5xl font-black text-blue-600 tracking-tight">{Math.round(stats?.averageScore || 0)}%</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-orange-100 transition-colors"></div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Streak</h3>
                  <p className="text-5xl font-black text-orange-500 tracking-tight">{stats?.currentStreak || 0} 🔥</p>
                  <p className="text-sm font-medium text-slate-400 mt-2">Best: {stats?.longestStreak || 0}</p>
                </div>
              </>
            )}
            {user.role === 'INSTRUCTOR' && analytics?.overview && (
              <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Challenges</h3>
                  <p className="text-4xl font-bold text-emerald-600">{analytics.overview.totalChallenges}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Students Reached</h3>
                  <p className="text-4xl font-bold text-blue-600">{analytics.overview.totalStudentsReached}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Global Pass Rate</h3>
                  <p className="text-4xl font-bold text-orange-500">{analytics.overview.averagePassRate}%</p>
                  <p className="text-sm text-slate-400 mt-1">{analytics.overview.totalAttemptsReceived} attempts</p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Analytics */}
            {user.role !== 'INSTRUCTOR' && analytics?.scoreTrend && (
              <>
                <div className="bg-white/90 p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="font-display text-xl font-extrabold text-slate-900 mb-6">Recent Score Trend</h3>
                  {analytics.scoreTrend.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.scoreTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="title" tick={{fontSize: 12}} tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val} />
                          <YAxis domain={[0, 100]} tick={{fontSize: 12}} />
                          <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-10">No recent data</p>
                  )}
                </div>

                <div className="bg-white/90 p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="font-display text-xl font-extrabold text-slate-900 mb-6">Activity (Last 28 Days)</h3>
                  {analytics.weeklyActivity?.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.weeklyActivity} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                          <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                          <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                          <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                     <p className="text-slate-500 text-center py-10">No recent activity</p>
                  )}
                </div>

                <div className="bg-white/90 p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="font-display text-xl font-extrabold text-slate-900 mb-6">Category Mastery</h3>
                  {analytics.categoryPerformance?.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={analytics.categoryPerformance} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="attempts" nameKey="category" label={({category}) => `${category}`}>
                             {analytics.categoryPerformance.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <RechartsTooltip formatter={(value, name, props) => [`${value} attempts (Avg: ${props.payload.avgScore}%)`, name]} />
                         </PieChart>
                       </ResponsiveContainer>
                    </div>
                  ) : (
                     <p className="text-slate-500 text-center py-10">No recent activity</p>
                  )}
                </div>

                <div className="bg-white/90 p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="font-display text-xl font-extrabold text-slate-900 mb-6">Difficulty Breakdown</h3>
                  {analytics.difficultyBreakdown?.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.difficultyBreakdown} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                          <XAxis dataKey="difficulty" tick={{fontSize: 12}} />
                          <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                          <RechartsTooltip cursor={{fill: '#f8fafc'}} formatter={(value, name, props) => [`${value} challenges (Avg: ${props.payload.avgScore}%)`, 'Completed']} />
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
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="text-lg font-semibold text-slate-900 mb-6">Challenge Overview</h3>
                   <div className="overflow-auto max-h-64">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                         <tr>
                           <th className="px-4 py-3">Challenge</th>
                           <th className="px-4 py-3">Attempts</th>
                           <th className="px-4 py-3">Pass Rate</th>
                         </tr>
                       </thead>
                       <tbody>
                         {analytics.challengePerformance.map(c => (
                           <tr key={c.id} className="border-b border-slate-100">
                             <td className="px-4 py-3 font-medium text-slate-900">{c.title}</td>
                             <td className="px-4 py-3 text-slate-600">{c.attempts}</td>
                             <td className="px-4 py-3">
                               <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.passRate >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
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

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="text-lg font-semibold text-slate-900 mb-6">Score Distribution</h3>
                   {analytics.scoreDistribution?.length > 0 ? (
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={analytics.scoreDistribution.filter(d => d.count > 0)} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="count" nameKey="bucket" label={({bucket, count}) => `${bucket}% (${count})`}>
                             {analytics.scoreDistribution.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <RechartsTooltip />
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                   ) : (
                     <p className="text-slate-500 text-center py-10">No data available</p>
                   )}
                 </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 lg:col-span-2">
                   <h3 className="text-lg font-semibold text-slate-900 mb-6">30-Day Engagement Timeline</h3>
                   {analytics.engagementTimeline?.length > 0 ? (
                     <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={analytics.engagementTimeline}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                           <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                           <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                           <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Recent Attempts</h3>
              </div>
              <div className="p-0">
                {!loading && recentAttempts.length === 0 ? (
                  <p className="p-6 text-slate-500 text-center">No recent attempts found. Start a challenge!</p>
                ) : (
                  <ul className="divide-y divide-slate-200">
                    {recentAttempts.map((attempt) => (
                      <li key={attempt._id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{attempt.challenge?.title || 'Unknown Challenge'}</p>
                            <p className="text-sm text-slate-500 mt-1">
                              Completed on {new Date(attempt.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${attempt.percentage >= 60 ? 'text-emerald-600' : 'text-rose-500'}`}>
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
