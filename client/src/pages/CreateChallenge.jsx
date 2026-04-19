import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateChallenge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
  });
  const [questions, setQuestions] = useState([
    { text: '', questionType: 'MCQ', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
  ]);

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
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create a New Challenge</h1>
        <p className="text-slate-600 mt-2">Design an interactive learning experience for other students.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        
        {/* Core Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">Challenge Details</h2>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
            <input 
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              placeholder="e.g. Advanced JavaScript Closure Exam"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              placeholder="Explain what the student will learn..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
            <select 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-700"
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Questions Manager */}
        <div className="space-y-8">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-2xl font-bold text-slate-800">Questions ({questions.length})</h2>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex justify-between">
                <h3 className="font-bold text-slate-700 flex items-center">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full inline-flex justify-center items-center text-xs mr-3">{qIndex + 1}</span>
                  Prompt
                </h3>
                <select 
                  className="p-2 border rounded-lg bg-white text-sm font-medium"
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
                className="w-full p-4 bg-white border border-slate-200 rounded-xl font-medium"
                placeholder="What is the meaning of life?"
                value={q.text}
                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
              />

              {/* Options logic based on Type */}
              {q.questionType === 'MCQ' ? (
                <div className="space-y-3 pl-4 border-l-2 border-indigo-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Answer Configuration</label>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-4">
                      <input 
                        type="radio" 
                        checked={opt.isCorrect} 
                        onChange={() => handleOptionChange(qIndex, oIndex, 'isCorrect', true)}
                        className="w-5 h-5 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                        title="Mark as correct answer"
                      />
                      <input 
                        required
                        className="flex-grow p-3 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                      />
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddOption(qIndex)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                    + Add false option
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pl-4 border-l-2 border-amber-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Accepted Text Answers</label>
                  {(q.acceptedAnswers || []).map((ans, aIndex) => (
                    <input 
                      key={aIndex}
                      required
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g. 42"
                      value={ans}
                      onChange={(e) => handleAcceptedAnswerChange(qIndex, aIndex, e.target.value)}
                    />
                  ))}
                  <button type="button" onClick={() => handleAddAcceptedAnswer(qIndex)} className="text-sm font-semibold text-amber-600 hover:text-amber-800">
                    + Add acceptable variant
                  </button>
                </div>
              )}
            </div>
          ))}

          <button 
            type="button" 
            onClick={handleAddQuestion}
            className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            + Add Another Question
          </button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xl font-bold hover:bg-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Challenge'}
        </button>
      </form>
    </div>
  );
}
