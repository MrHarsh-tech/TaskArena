import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function QuickPlay() {
  const [loading, setLoading] = useState(false);
  const [challengeId, setChallengeId] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && challengeId) {
      navigate(`/challenges/${challengeId}`);
    }
  }, [countdown, challengeId, navigate]);

  const handleQuickPlay = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const res = await axios.get(`${API_URL}/quick-play`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data._id) {
        setChallengeId(res.data._id);
        setCountdown(3);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Could not find a random challenge right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl relative bg-slate-900 animate-in mt-10 border border-slate-700">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20mix-blend-overlay"></div>
       <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-30"></div>
       <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-20"></div>

       <div className="relative z-10 p-16 text-center">
         <h1 className="text-5xl font-black text-white tracking-tight mb-4">Quick Play</h1>
         <p className="text-xl text-slate-300 font-medium max-w-sm mx-auto mb-12">
            Let fate decide! We'll match you with a challenge tailored to test your mastery.
         </p>

         {countdown > 0 ? (
           <div className="flex flex-col items-center">
             <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 animate-pulse drop-shadow-2xl mb-4">
               {countdown}
             </div>
             <p className="text-slate-400 font-semibold uppercase tracking-widest animate-pulse">Entering the Arena...</p>
           </div>
         ) : loading ? (
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-slate-400 font-semibold uppercase tracking-widest">Finding Match...</p>
           </div>
         ) : (
           <button 
             onClick={handleQuickPlay}
             className="relative group overflow-hidden inline-flex items-center px-10 py-5 font-bold rounded-full text-white bg-indigo-600 hover:scale-105 transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.8)]"
           >
             <span className="relative z-10 text-xl flex items-center gap-2">
                Roll the Dice <span className="text-2xl group-hover:animate-bounce">🎲</span>
             </span>
             <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_auto] animate-shimmer"></div>
           </button>
         )}
       </div>
    </div>
  );
}
