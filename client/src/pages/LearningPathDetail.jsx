import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

export default function LearningPathDetail() {
  const { id } = useParams();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const res = await axios.get(`${API_URL}/learning-paths/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPath(res.data);
      } catch (error) {
        console.error('Failed to fetch path details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPath();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse font-medium">Loading Path details...</div>;
  if (!path) return <div className="text-center py-20 text-slate-500">Learning path not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in">
      <div className="bg-slate-900 text-white p-12 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-9xl opacity-10">{path.iconEmoji || '📚'}</div>
        <div className="relative z-10">
          <div className="text-5xl mb-4">{path.iconEmoji || '📚'}</div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">{path.title}</h1>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">{path.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Path Steps</h2>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {path.steps?.map((step, index) => (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-indigo-600 text-white font-bold shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-transform group-hover:scale-110">
                {step.orderIndex}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl shadow-sm bg-slate-50 border border-slate-100 transition-all hover:shadow-md hover:bg-white group-hover:-translate-y-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {step.challenge?.title || 'Unknown Challenge'}
                  </h3>
                  {step.xpBonus > 0 && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full whitespace-nowrap">
                      +{step.xpBonus} XP Bonus
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {step.challenge?.description || 'No description available.'}
                </p>
                <Link 
                  to={`/challenges/${step.challenge?._id}`}
                  className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Start Step <span className="ml-1 text-lg leading-none">→</span>
                </Link>
              </div>
            </div>
          ))}
          
          {(!path.steps || path.steps.length === 0) && (
             <div className="text-center py-10 text-slate-500">
               No steps have been added to this path yet.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
