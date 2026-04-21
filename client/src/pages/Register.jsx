import { useContext, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('STUDENT');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-white/10' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' };
    if (score === 2) return { score, label: 'Good', color: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' };
    return { score, label: 'Strong', color: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend Validation
    if (name.trim().length < 2) {
      alert('Name must be at least 2 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (passwordStrength.label === 'Weak') {
      if (!confirm('Your password is weak. Do you want to continue anyway?')) {
        return;
      }
    }

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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden mesh-gradient-dark animate-in rounded-3xl mt-4 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-[2.5rem] relative z-10 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(139,92,246,0.15)] group">
        <div>
          <h2 className="mt-2 text-center font-display text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Join the Arena</h2>
          <p className="text-slate-400 mt-2 font-medium text-center">Create your account to start learning</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f]/80 px-4 py-3 h-12 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:bg-[#0a0a0f] transition-all font-medium drop-shadow-sm" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f]/80 px-4 py-3 h-12 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:bg-[#0a0a0f] transition-all font-medium drop-shadow-sm" 
              required
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1 flex justify-between items-center">
              Password
              {password && (
                <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full ${passwordStrength.color} text-white`}>
                  {passwordStrength.label}
                </span>
              )}
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0f]/80 px-4 py-3 h-12 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:bg-[#0a0a0f] transition-all font-medium pr-12 drop-shadow-sm" 
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator Bars */}
            {password && (
              <div className="flex gap-1 mt-2 px-1">
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-white/10'}`}></div>
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-white/10'}`}></div>
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-white/10'}`}></div>
                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-white/10'}`}></div>
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-1.5 ml-1 font-medium">Use 8+ chars with mix of letters, numbers & symbols</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 ml-1">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
              <label 
                className={`relative flex flex-col items-center p-4 cursor-pointer rounded-2xl border transition-all ${role === 'STUDENT' ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="STUDENT" 
                  checked={role === 'STUDENT'}
                  onChange={() => setRole('STUDENT')}
                  className="sr-only"
                />
                <span className="text-3xl mb-2 drop-shadow-md">🎓</span>
                <span className={`font-bold text-sm ${role === 'STUDENT' ? 'text-fuchsia-300' : 'text-slate-400'}`}>Learn</span>
              </label>
              <label 
                className={`relative flex flex-col items-center p-4 cursor-pointer rounded-2xl border transition-all ${role === 'INSTRUCTOR' ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="INSTRUCTOR" 
                  checked={role === 'INSTRUCTOR'}
                  onChange={() => setRole('INSTRUCTOR')}
                  className="sr-only"
                />
                <span className="text-3xl mb-2 drop-shadow-md">👨‍🏫</span>
                <span className={`font-bold text-sm ${role === 'INSTRUCTOR' ? 'text-indigo-300' : 'text-slate-400'}`}>Teach</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white py-4 rounded-xl font-bold mt-8 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-[1.02] transition-all active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm font-medium text-slate-400">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-all">Log in</Link>
        </p>
      </div>
    </div>
  );
}
