import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Fallback categories in case API is unreachable
const FALLBACK_CATEGORIES = [
  { _id: 'javascript', name: 'JavaScript' },
  { _id: 'react', name: 'React' },
  { _id: 'nodejs', name: 'Node.js' },
  { _id: 'python', name: 'Python' },
  { _id: 'data-science', name: 'Data Science' },
  { _id: 'devops', name: 'DevOps' },
];

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy', color: '#22C55E' },
  { value: 'MEDIUM', label: 'Medium', color: '#F97316' },
  { value: 'HARD', label: 'Hard', color: '#EF4444' },
];

// Custom Dropdown Component
function CustomSelect({ options, value, onChange, placeholder, getLabel, getValue, colorKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => getValue(o) === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full p-4 bg-[#0B0F1A] border border-[rgba(255,255,255,0.12)] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-white text-left flex items-center justify-between transition-all hover:border-indigo-500/50"
      >
        <span style={selected && colorKey ? { color: selected[colorKey] } : {}} className={!selected ? 'text-zinc-500' : ''}>
          {selected ? getLabel(selected) : placeholder}
        </span>
        <svg className={`w-4 h-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[#0B0F1A] border border-[rgba(255,255,255,0.12)] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          {options.map(opt => (
            <button
              key={getValue(opt)}
              type="button"
              onClick={() => { onChange(getValue(opt)); setOpen(false); }}
              className={`w-full px-4 py-3 text-left font-medium hover:bg-indigo-600/20 transition-colors flex items-center gap-2 ${
                getValue(opt) === value ? 'bg-indigo-600/30 text-white' : 'text-zinc-200'
              }`}
            >
              {colorKey && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt[colorKey] }}></span>}
              {getLabel(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreateChallenge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    categoryId: '',
  });
  const [questions, setQuestions] = useState([
    { text: '', questionType: 'MCQ', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_URL}/categories`);
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
        } else {
          // Use fallback if API returns empty
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.error('Failed to fetch categories, using fallback:', error);
        setCategories(FALLBACK_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', questionType: 'MCQ', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  const handleAddOption = (qIndex) => {
    const newQ = [...questions];
    newQ[qIndex].options.push({ text: '', isCorrect: false });
    setQuestions(newQ);
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const newQ = [...questions];
    if (field === 'isCorrect') {
      newQ[qIndex].options.forEach((opt, i) => opt.isCorrect = i === oIndex);
    } else {
      newQ[qIndex].options[oIndex][field] = value;
    }
    setQuestions(newQ);
  };

  const handleAddAcceptedAnswer = (qIndex) => {
    const newQ = [...questions];
    if (!newQ[qIndex].acceptedAnswers) newQ[qIndex].acceptedAnswers = [];
    newQ[qIndex].acceptedAnswers.push('');
    setQuestions(newQ);
  };

  const handleAcceptedAnswerChange = (qIndex, ansIndex, value) => {
    const newQ = [...questions];
    newQ[qIndex].acceptedAnswers[ansIndex] = value;
    setQuestions(newQ);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      await axios.post(`${API_URL}/challenges`, { ...formData, questions }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/challenges');
    } catch (error) {
      alert('Failed to create challenge: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Create a New Challenge</h1>
        <p className="text-zinc-400 mt-2">Design an interactive learning experience for other students.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 glass-panel p-10">
        
        {/* Core Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-[rgba(255,255,255,0.08)] pb-2">Challenge Details</h2>
          
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Title</label>
            <input 
              required
              className="w-full p-4 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-zinc-500"
              placeholder="e.g. Advanced JavaScript Closure Exam"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full p-4 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-zinc-500"
              placeholder="Explain what the student will learn..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Category</label>
            <CustomSelect
              options={categories}
              value={formData.categoryId}
              onChange={(val) => setFormData({...formData, categoryId: val})}
              placeholder="Select a category..."
              getLabel={(o) => o.name}
              getValue={(o) => o._id}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Difficulty</label>
            <CustomSelect
              options={DIFFICULTIES}
              value={formData.difficulty}
              onChange={(val) => setFormData({...formData, difficulty: val})}
              placeholder="Select difficulty..."
              getLabel={(o) => o.label}
              getValue={(o) => o.value}
              colorKey="color"
            />
          </div>
        </div>

        {/* Questions Manager */}
        <div className="space-y-8">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-2">
            <h2 className="text-2xl font-bold text-white">Questions ({questions.length})</h2>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-6 sm:p-8 glass-panel space-y-6 hover:border-[rgba(255,255,255,0.15)] transition-colors">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center">
                  <span className="bg-gradient-primary text-white w-7 h-7 rounded-full inline-flex justify-center items-center text-xs mr-3 shadow-[0_0_15px_rgba(168,85,247,0.4)]">{qIndex + 1}</span>
                  Question {qIndex + 1}
                </h3>
                <select 
                  className="p-2 border border-[rgba(255,255,255,0.08)] rounded-lg bg-[#0B0F1A] text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 appearance-none"
                  value={q.questionType}
                  onChange={(e) => {
                    handleQuestionChange(qIndex, 'questionType', e.target.value);
                    if (e.target.value === 'FILL_IN_BLANK' && !q.acceptedAnswers) {
                      handleQuestionChange(qIndex, 'acceptedAnswers', ['']);
                    }
                  }}
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="FILL_IN_BLANK">Fill in the Blank</option>
                </select>
              </div>

              <input 
                required
                className="w-full p-4 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl font-medium text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="What is the meaning of life?"
                value={q.text}
                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
              />

              {/* Options logic based on Type */}
              {q.questionType === 'MCQ' ? (
                <div className="space-y-3 pl-4 border-l-2 border-indigo-500/30">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Answer Configuration</label>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-4">
                      <div className="relative flex items-center justify-center w-6 h-6">
                        <input 
                          type="radio" 
                          checked={opt.isCorrect} 
                          onChange={() => handleOptionChange(qIndex, oIndex, 'isCorrect', true)}
                          className="peer absolute w-full h-full opacity-0 cursor-pointer z-10"
                          title="Mark as correct answer"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500/20' : 'border-zinc-500 bg-transparent peer-hover:border-emerald-500/50'}`}>
                          {opt.isCorrect && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                        </div>
                      </div>
                      <input 
                        required
                        className="flex-grow p-3 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500 hover:border-[rgba(255,255,255,0.2)] transition-colors"
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                      />
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddOption(qIndex)} className="text-xs py-1.5 px-3 mt-2 rounded-lg border border-dashed border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500 transition-colors inline-block">
                    + Add false option
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pl-4 border-l-2 border-amber-500/30">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Accepted Text Answers</label>
                  {(q.acceptedAnswers || []).map((ans, aIndex) => (
                    <input 
                      key={aIndex}
                      required
                      className="w-full p-3 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="e.g. 42"
                      value={ans}
                      onChange={(e) => handleAcceptedAnswerChange(qIndex, aIndex, e.target.value)}
                    />
                  ))}
                  <button type="button" onClick={() => handleAddAcceptedAnswer(qIndex)} className="text-xs py-1.5 px-3 mt-2 rounded-lg border border-dashed border-amber-500/30 text-amber-400 hover:text-amber-300 hover:border-amber-500 transition-colors inline-block">
                    + Add acceptable variant
                  </button>
                </div>
              )}
            </div>
          ))}

          <button 
            type="button" 
            onClick={handleAddQuestion}
            className="w-full py-4 border border-dashed border-[rgba(255,255,255,0.2)] text-zinc-400 bg-white/5 rounded-2xl font-bold hover:border-indigo-500 hover:text-white hover:bg-white/10 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            + Add Another Question
          </button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-5 bg-gradient-primary text-white rounded-2xl text-xl font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1 transition-all disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Challenge'}
        </button>
      </form>
    </div>
  );
}
