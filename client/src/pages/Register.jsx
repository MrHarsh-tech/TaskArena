import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden mesh-gradient animate-in">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-glass border border-white/50 relative z-10 transition-all duration-300 hover:shadow-xl hover:bg-white/80">
        <div>
          <h2 className="mt-2 text-center font-display text-4xl font-extrabold text-slate-900 tracking-tight">Join the Arena</h2>
          <p className="text-slate-500 mt-2 font-medium text-center">Create your account to start learning</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 h-12 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 h-12 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 h-12 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
              <label 
                className={`relative flex flex-col items-center p-4 cursor-pointer rounded-2xl border-2 transition-all ${role === 'STUDENT' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="STUDENT" 
                  checked={role === 'STUDENT'}
                  onChange={() => setRole('STUDENT')}
                  className="sr-only"
                />
                <span className="text-3xl mb-2">🎓</span>
                <span className={`font-bold text-sm ${role === 'STUDENT' ? 'text-indigo-700' : 'text-slate-600'}`}>Learn</span>
              </label>
              <label 
                className={`relative flex flex-col items-center p-4 cursor-pointer rounded-2xl border-2 transition-all ${role === 'INSTRUCTOR' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="INSTRUCTOR" 
                  checked={role === 'INSTRUCTOR'}
                  onChange={() => setRole('INSTRUCTOR')}
                  className="sr-only"
                />
                <span className="text-3xl mb-2">👨‍🏫</span>
                <span className={`font-bold text-sm ${role === 'INSTRUCTOR' ? 'text-indigo-700' : 'text-slate-600'}`}>Teach</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold mt-6 shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-xl transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-800">Log in</Link>
        </p>
      </div>
    </div>
  );
}
