import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in">
      <div className="text-9xl mb-8">🏜️</div>
      <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">404 Not Found</h1>
      <p className="text-xl text-slate-600 mb-10 text-center max-w-md">
        Looks like you've wandered into an empty arena. This page does not exist.
      </p>
      <Link 
        to="/" 
        className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-1"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
