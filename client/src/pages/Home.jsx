import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="animate-in space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/50 to-emerald-50/60" />
        
        <div className="relative mx-auto max-w-4xl px-4 flex flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            ✨ Now in Beta — Start learning today
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-slate-900 mb-6">
            Learn, Compete, and{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
              Master Skills
            </span>{' '}
            Through Challenges
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl">
            TaskArena is where instructors craft engaging MCQ challenges and students 
            sharpen their knowledge — with instant feedback, leaderboards, and progress tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg hover:shadow-indigo-200">
              Get Started Free
            </Link>
            <Link to="/challenges" className="bg-white text-indigo-600 border-2 border-indigo-100 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all">
              Browse Challenges
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to level up</h2>
          <p className="text-slate-600">Whether you're teaching or learning, TaskArena gives you the tools to succeed.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { tag: "📝", title: "MCQ & Fill-in-the-Blanks", desc: "Create diverse challenges with multiple choice and free-text formatting." },
            { tag: "⚡", title: "XP & Leveling System", desc: "Earn experience points with every attempt. Level up, unlock achievements." },
            { tag: "📊", title: "Detailed Analytics", desc: "Students get score trends, activity heatmaps. Instructors see difficulty analysis." },
            { tag: "🏆", title: "Leaderboards", desc: "Compete with peers on global and per-challenge leaderboards." },
            { tag: "🧠", title: "Instructor Dashboard", desc: "Score distributions, completion funnels, and answer analysis." },
            { tag: "🎮", title: "Role-Based Access", desc: "Students and instructors each get tailored dashboards." },
          ].map((feat, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-4">{feat.tag}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">Join TaskArena today and start your journey toward mastery.</p>
          <Link to="/register" className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
