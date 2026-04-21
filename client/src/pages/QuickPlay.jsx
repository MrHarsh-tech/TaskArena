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
    <div className="max-w-2xl mx-auto rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative glass-card animate-in mt-10 border border-white/10">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
       <div className="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
       <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

       <div className="relative z-10 p-16 text-center">
         <h1 className="font-display text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 tracking-tight mb-6 neon-text-glow">Quick Play</h1>
         <p className="text-xl text-slate-300 max-w-sm mx-auto mb-12 font-light">
            Let fate decide! We'll match you with a challenge tailored to test your mastery.
         </p>

         {countdown > 0 ? (
           <div className="flex flex-col items-center">
             <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400 animate-pulse drop-shadow-[0_0_20px_rgba(217,70,239,0.5)] mb-4">
               {countdown}
             </div>
             <p className="text-fuchsia-300 font-bold uppercase tracking-widest animate-pulse">Entering the Arena...</p>
           </div>
         ) : loading ? (
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
             <p className="text-fuchsia-300 font-bold uppercase tracking-widest">Finding Match...</p>
           </div>
         ) : (
           <button 
             onClick={handleQuickPlay}
             className="relative group overflow-hidden inline-flex items-center px-10 py-5 font-bold rounded-full text-white bg-[#0a0a0f] border border-fuchsia-500/50 hover:border-fuchsia-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:shadow-[0_0_50px_rgba(217,70,239,0.6)]"
           >
             <span className="relative z-10 text-xl flex items-center gap-2">
                Roll the Dice <span className="text-2xl group-hover:animate-bounce drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🎲</span>
             </span>
             <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600/50 via-fuchsia-600/50 to-indigo-600/50 opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_auto] animate-shimmer"></div>
           </button>
         )}
       </div>
    </div>
  );
}
