import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [challenge, setChallenge] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const res = await axios.get(`${API_URL}/challenges/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setChallenge(res.data);

        if (user) {
          const bms = await axios.get(`${API_URL}/bookmarks/statuses`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsBookmarked(bms.data.includes(id));
        }

      } catch (error) {
        console.error('Failed to fetch challenge', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id, user]);

  const toggleBookmark = async () => {
    if (!user) return alert("Please log in to bookmark.");
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_URL}/bookmarks/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsBookmarked(res.data.isBookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
    }
  };

  const handleInputChange = (questionId, value, type) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOptionId: type === 'MCQ' ? value : null,
        textResponse: type === 'FILL_IN_BLANK' ? value : null
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const payload = {
        answers: Object.values(answers),
        timeTakenSeconds: 0 
      };

      const res = await axios.post(`${API_URL}/challenges/${id}/attempt`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResult(res.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit attempt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-medium animate-pulse text-zinc-400">Loading Challenge Database...</div>;
  if (!challenge) return <div className="text-center py-20 text-xl font-medium text-rose-400">Challenge Not Found</div>;

  if (result) {
    const isPass = result.attempt.percentage >= 60;
    return (
      <div className="max-w-3xl mx-auto animate-in mt-10">
        <div className="glass-panel overflow-hidden">
          <div className={`p-12 text-center text-white relative overflow-hidden ${isPass ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : 'bg-gradient-to-br from-rose-500 to-red-700'}`}>
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 rounded-full bg-black opacity-10"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-8xl mb-6 drop-shadow-lg animate-bounce">{isPass ? '🏆' : '📚'}</div>
              <h2 className="font-display text-5xl font-black mb-4 tracking-tight">{isPass ? 'Challenge Passed!' : 'Requires Revision!'}</h2>
              <p className="text-white/90 text-lg font-medium">You scored {result.attempt.score} out of {result.attempt.totalQuestions}</p>
            </div>
          </div>
          
          <div className="p-12 flex flex-col items-center space-y-8 bg-transparent">
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <div className="text-center p-6 bg-white/5 rounded-2xl border border-[rgba(255,255,255,0.08)] transform transition-transform hover:-translate-y-[5px]">
                <div className="text-5xl font-black text-white mb-1">{Math.round(result.attempt.percentage)}<span className="text-2xl text-zinc-500">%</span></div>
                <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Accuracy</div>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-2xl border border-[rgba(255,255,255,0.08)] transform transition-transform hover:-translate-y-[5px]">
                <div className="text-5xl font-black text-indigo-400 mb-1">+{result.xpEarned}</div>
                <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase">XP Earned</div>
              </div>
            </div>

            {/* Mystery Reward Notice */}
            {result.reward?.message && (
              <div className="w-full max-w-md bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-yellow-300 rounded-xl p-5 flex items-center shadow-lg animate-in transform transition-transform hover:scale-105">
                <div className="text-4xl mr-4 animate-bounce">🎁</div>
                <div>
                  <h3 className="font-bold text-yellow-800 text-sm tracking-widest uppercase mb-0.5">{result.reward.message}</h3>
                  <p className="text-yellow-700 font-medium text-sm">
                    You received a <strong className="text-yellow-900">{result.reward.multiplier}x multiplier</strong>! 
                    Base XP: {result.reward.baseXp} → Final XP: {result.reward.finalXp}
                  </p>
                </div>
              </div>
            )}

            {/* Level up notification if applicable */}
            <div className="w-full max-w-md bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between">
               <div>
                 <p className="text-sm font-bold text-indigo-100">Current Level</p>
                 <p className="text-xs text-indigo-300 mt-0.5">Keep practicing to level up!</p>
               </div>
               <div className="bg-gradient-primary px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(99,102,241,0.4)] font-bold text-white">
                 Level {result.newLevel}
               </div>
            </div>
            
            <button 
              onClick={() => navigate('/')}
              className="w-full max-w-md px-10 py-4 bg-gradient-primary text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all hover:-translate-y-[5px]"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="cosmic-dashboard-bg">
        <div className="cosmic-stars"></div>
      </div>
      <div className="max-w-4xl mx-auto glass-panel overflow-hidden animate-in relative z-10">
      <div className="p-10 border-b border-[rgba(255,255,255,0.08)] bg-white/5 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${challenge.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400' : challenge.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {challenge.difficulty}
            </span>
            
            {challenge.creator && (
               <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)]">
                 <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white border border-white/20 overflow-hidden">
                   {challenge.creator.avatarUrl ? (
                     <img src={challenge.creator.avatarUrl} alt={challenge.creator.name} className="w-full h-full object-cover" />
                   ) : (
                     challenge.creator.name?.charAt(0) || 'I'
                   )}
                 </div>
                 <span className="text-sm font-medium text-zinc-300">{challenge.creator.name}</span>
               </div>
            )}
            
            {user && (
              <button 
                onClick={toggleBookmark}
                className={`ml-auto p-2.5 rounded-full border border-[rgba(255,255,255,0.08)] transition-all shadow-sm ${isBookmarked ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20' : 'bg-white/5 text-zinc-400 hover:border-rose-500/50 hover:text-rose-400'}`}
                title={isBookmarked ? "Remove Bookmark" : "Save Challenge"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          <h1 className="font-display text-5xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-sm">{challenge.title}</h1>
          <p className="text-lg text-zinc-300 leading-relaxed max-w-3xl">{challenge.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-12">
        {challenge.questions.map((q, index) => (
          <div key={q._id} className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <span className="bg-gradient-primary text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-4 flex-shrink-0 text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                {index + 1}
              </span>
              <span className="leading-relaxed">{q.text}</span>
            </h3>

            <div className="pl-12">
              {q.questionType === 'MCQ' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map(option => (
                    <label 
                      key={option._id} 
                      className={`flex items-center p-5 rounded-xl border cursor-pointer transition-all ${answers[q._id]?.selectedOptionId === option._id ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_4px_20px_rgba(99,102,241,0.15)]' : 'bg-white/5 border-[rgba(255,255,255,0.08)] hover:border-indigo-500/50'}`}
                    >
                      <input 
                        type="radio" 
                        name={`question-${q._id}`} 
                        value={option._id}
                        checked={answers[q._id]?.selectedOptionId === option._id || false}
                        required
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-zinc-500 bg-transparent focus:ring-offset-0 focus:ring-offset-transparent"
                        onChange={(e) => handleInputChange(q._id, e.target.value, 'MCQ')}
                      />
                      <span className="ml-4 text-white font-medium">{option.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input 
                  type="text" 
                  required
                  placeholder="Type your exact answer here..."
                  className="w-full p-5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white font-medium transition-all placeholder-zinc-500"
                  onChange={(e) => handleInputChange(q._id, e.target.value, 'FILL_IN_BLANK')}
                />
              )}
            </div>
          </div>
        ))}

        <div className="pt-8 border-t border-[rgba(255,255,255,0.08)] flex justify-end">
          <button 
            type="submit" 
            disabled={submitting}
            className="px-10 py-5 bg-gradient-primary text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none w-full md:w-auto"
          >
            {submitting ? 'Evaluating Submission...' : 'Submit Answers & Calculate Score'}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
