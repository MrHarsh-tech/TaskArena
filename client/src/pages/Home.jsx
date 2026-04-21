import { Link } from 'react-router-dom';
import { useMemo } from 'react';

const StarsBackground = () => {
  const colors = ['#ffffff', '#e0e7ff', '#f5d0fe', '#c7d2fe']; // Pure white, soft indigo, soft fuchsia, ice blue
  
  const stars = useMemo(() => Array.from({ length: 300 }).map(() => {
    const size = Math.random() * 4 + 1.5; // Bigger sizes between 1.5px and 5.5px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isBright = Math.random() > 0.6; // 40% of stars are extra bright
    
    return {
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      animationDelay: Math.random() * 5 + 's',
      animationDuration: Math.random() * 3 + 2 + 's',
      size: size + 'px',
      opacity: isBright ? Math.random() * 0.2 + 0.8 : Math.random() * 0.4 + 0.4, // Higher global opacity
      color: color,
      glow: size * (isBright ? 12 : 5) + 'px' // Massive glow radius for more light
    };
  }), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            opacity: star.opacity,
            animationDelay: star.animationDelay,
            animationDuration: star.animationDuration,
            boxShadow: `0 0 ${star.glow} ${star.color}, 0 0 ${parseFloat(star.glow)*2}px ${star.color}`
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  return (
    <div className="animate-in space-y-24 pb-20 relative">
      <StarsBackground />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-36 text-center mesh-gradient-dark border-b border-white/5 rounded-b-[3rem]">
        <div className="absolute inset-0 bg-[#05050a]/70 backdrop-blur-[1px]" />
        
        <div className="relative mx-auto max-w-5xl px-4 flex flex-col items-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md px-5 py-2 text-sm font-bold text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] float-animation">
            <span className="animate-pulse">✨</span> Now in Beta — Start learning today
          </div>

          <h1 className="font-display text-5xl font-black tracking-tight sm:text-7xl text-white mb-6 drop-shadow-xl leading-tight">
            Learn, Compete, and{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 neon-text-glow">
              Master Skills
            </span>{' '}
            Through Challenges
          </h1>

          <p className="text-xl text-slate-300 mb-10 max-w-2xl font-light leading-relaxed">
            TaskArena is where instructors craft engaging MCQ challenges and students 
            sharpen their knowledge — with instant feedback, leaderboards, and progress tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <Link to="/register" className="bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] border border-white/10">
              Get Started Free
            </Link>
            <Link to="/challenges" className="glass-card text-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 hover:text-white transition-all border border-indigo-500/20 hover:border-indigo-400/50">
              Browse Challenges
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl font-black text-white mb-4 drop-shadow-md">Everything you need to level up</h2>
          <p className="text-lg text-slate-400">Whether you're teaching or learning, TaskArena gives you the tools to succeed.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            { tag: "📝", title: "MCQ & Fill-in-the-Blanks", desc: "Create diverse challenges with multiple choice and free-text formatting." },
            { tag: "⚡", title: "XP & Leveling System", desc: "Earn experience points with every attempt. Level up, unlock achievements." },
            { tag: "📊", title: "Detailed Analytics", desc: "Students get score trends, activity heatmaps. Instructors see difficulty analysis." },
            { tag: "🏆", title: "Leaderboards", desc: "Compete with peers on global and per-challenge leaderboards." },
            { tag: "🧠", title: "Instructor Dashboard", desc: "Score distributions, completion funnels, and answer analysis." },
            { tag: "🎮", title: "Role-Based Access", desc: "Students and instructors each get tailored dashboards." },
          ].map((feat, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 group hover:shadow-[0_10px_40px_rgba(139,92,246,0.15)] hover:border-fuchsia-500/30">
              <div className="text-4xl mb-6 bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform group-hover:bg-fuchsia-500/10 group-hover:border-fuchsia-500/30 shadow-inner">{feat.tag}</div>
              <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-fuchsia-300 transition-colors">{feat.title}</h3>
              <p className="text-slate-400 leading-relaxed font-light">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 z-0" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/30 rounded-full blur-[80px] z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] z-0" />
          
          <div className="relative z-10 p-16 text-center text-white">
            <h2 className="text-4xl font-black mb-6 drop-shadow-md">Ready to start learning?</h2>
            <p className="text-indigo-200 mb-10 max-w-2xl mx-auto text-lg">Join TaskArena today and start your journey toward mastery.</p>
            <Link to="/register" className="inline-block bg-white text-indigo-950 px-10 py-5 rounded-xl font-black text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
