import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const res = await axios.get(`${API_URL}/challenges/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setChallenge(res.data);
      } catch (error) {
        console.error('Failed to fetch challenge', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

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

  if (loading) return <div className="text-center py-20 text-xl font-medium animate-pulse text-slate-500">Loading Challenge Database...</div>;
  if (!challenge) return <div className="text-center py-20 text-xl font-medium text-rose-500">Challenge Not Found</div>;

  if (result) {
    const isPass = result.attempt.percentage >= 60;
    return (
      <div className="max-w-3xl mx-auto animate-in mt-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className={`p-12 text-center text-white relative overflow-hidden ${isPass ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : 'bg-gradient-to-br from-rose-500 to-red-700'}`}>
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 rounded-full bg-black opacity-10"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-8xl mb-6 drop-shadow-lg animate-bounce">{isPass ? '🏆' : '📚'}</div>
              <h2 className="text-4xl font-extrabold mb-2 tracking-tight">{isPass ? 'Challenge Passed!' : 'Requires Revision!'}</h2>
              <p className="text-white/90 text-lg font-medium">You scored {result.attempt.score} out of {result.attempt.totalQuestions}</p>
            </div>
          </div>
          
          <div className="p-12 flex flex-col items-center space-y-8 bg-slate-50">
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 transform transition-transform hover:scale-105">
                <div className="text-5xl font-black text-slate-900 mb-1">{Math.round(result.attempt.percentage)}<span className="text-2xl text-slate-400">%</span></div>
                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">Accuracy</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 transform transition-transform hover:scale-105">
                <div className="text-5xl font-black text-indigo-600 mb-1">+{result.xpEarned}</div>
                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">XP Earned</div>
              </div>
            </div>

            {/* Level up notification if applicable */}
            <div className="w-full max-w-md bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
               <div>
                 <p className="text-sm font-bold text-indigo-900">Current Level</p>
                 <p className="text-xs text-indigo-700 mt-0.5">Keep practicing to level up!</p>
               </div>
               <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100 font-bold text-indigo-600">
                 Level {result.newLevel}
               </div>
            </div>
            
            <button 
              onClick={() => navigate('/')}
              className="w-full max-w-md px-10 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-indigo-600 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in">
      <div className="p-10 border-b border-slate-100 bg-slate-50 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${challenge.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-800' : challenge.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
              {challenge.difficulty}
            </span>
            
            {challenge.creator && (
               <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                 <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 overflow-hidden">
                   {challenge.creator.avatarUrl ? (
                     <img src={challenge.creator.avatarUrl} alt={challenge.creator.name} className="w-full h-full object-cover" />
                   ) : (
                     challenge.creator.name?.charAt(0) || 'I'
                   )}
                 </div>
                 <span className="text-sm font-medium text-slate-700">{challenge.creator.name}</span>
               </div>
            )}
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">{challenge.title}</h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">{challenge.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-12">
        {challenge.questions.map((q, index) => (
          <div key={q._id} className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex">
              <span className="bg-slate-900 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-4 flex-shrink-0 text-sm">
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
                      className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all ${answers[q._id]?.selectedOptionId === option._id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <input 
                        type="radio" 
                        name={`question-${q._id}`} 
                        value={option._id}
                        checked={answers[q._id]?.selectedOptionId === option._id || false}
                        required
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        onChange={(e) => handleInputChange(q._id, e.target.value, 'MCQ')}
                      />
                      <span className="ml-4 text-slate-700 font-medium">{option.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input 
                  type="text" 
                  required
                  placeholder="Type your exact answer here..."
                  className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-0 text-slate-900 font-medium transition-colors"
                  onChange={(e) => handleInputChange(q._id, e.target.value, 'FILL_IN_BLANK')}
                />
              )}
            </div>
          </div>
        ))}

        <div className="pt-8 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={submitting}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {submitting ? 'Evaluating Submission...' : 'Submit Answers & Calculate Score'}
          </button>
        </div>
      </form>
    </div>
  );
}
