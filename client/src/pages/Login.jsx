import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden mesh-gradient-dark animate-in rounded-3xl mt-4 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-[2.5rem] relative z-10 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(139,92,246,0.15)] group">
        <div>
          <h2 className="mt-2 text-center font-display text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Login to TaskArena</h2>
          <p className="text-slate-400 mt-2 font-medium text-center">Welcome back! Please enter your details.</p>
        </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0a0a0f]/80 px-4 py-3 h-12 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:bg-[#0a0a0f] transition-all font-medium drop-shadow-sm" 
            required
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">Password</label>
          <input 
            type={showPassword ? "text" : "password"} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0a0a0f]/80 px-4 py-3 h-12 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:bg-[#0a0a0f] transition-all font-medium pr-12 drop-shadow-sm" 
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white py-4 rounded-xl font-bold mt-8 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-[1.02] transition-all active:scale-100 border border-white/10">
          Sign In
        </button>
      </form>
      <p className="mt-8 text-center text-sm font-medium text-slate-400">
        Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-all">Register</Link>
      </p>
      </div>
    </div>
  );
}
