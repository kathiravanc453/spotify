import { useState } from 'react';
import { Music2, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper: check if backend API is reachable
  const isBackendAvailable = async () => {
    try {
      const res = await fetch('/api/songs', { method: 'GET' });
      const ct = res.headers.get('content-type') || '';
      return res.ok && ct.includes('application/json');
    } catch {
      return false;
    }
  };

  // LocalStorage-based auth fallback (used on Vercel where no backend runs)
  const localRegister = (userName, userEmail, userPassword) => {
    const users = JSON.parse(localStorage.getItem('rhythmix_users') || '[]');
    if (users.find(u => u.email.toLowerCase() === userEmail.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      name: userName,
      email: userEmail.toLowerCase(),
      password: userPassword,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`,
      role: userEmail.toLowerCase() === 'admin@rhythmix.com' ? 'admin' : 'user',
    };
    users.push(newUser);
    localStorage.setItem('rhythmix_users', JSON.stringify(users));
    const { password: _, ...session } = newUser;
    return session;
  };

  const localLogin = (userEmail, userPassword) => {
    const users = JSON.parse(localStorage.getItem('rhythmix_users') || '[]');
    const user = users.find(
      u => u.email.toLowerCase() === userEmail.toLowerCase() && u.password === userPassword
    );
    if (!user) throw new Error('Invalid email or password.');
    const { password: _, ...session } = user;
    return session;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const backendUp = await isBackendAvailable();

      let data;
      if (backendUp) {
        // ✅ Backend available (running locally) — use Express API
        const url = isSignUp ? '/api/register' : '/api/login';
        const body = isSignUp ? { name, email, password } : { email, password };
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Server error. Please try again.');
        }
        data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Something went wrong.');
      } else {
        // 🌐 No backend (Vercel deployment) — use localStorage auth
        data = isSignUp
          ? localRegister(name, email, password)
          : localLogin(email, password);
      }

      localStorage.setItem('rhythmix_session', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const backendUp = await isBackendAvailable();
      let data;

      if (backendUp) {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'demo@rhythmix.com', password: 'demo' }),
        });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Server error.');
        data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Demo login failed.');
      } else {
        // On Vercel: auto-create demo session in localStorage
        const demoUser = {
          name: 'Demo User',
          email: 'demo@rhythmix.com',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo',
          role: 'user',
        };
        // Register demo user if not exists
        const users = JSON.parse(localStorage.getItem('rhythmix_users') || '[]');
        if (!users.find(u => u.email === 'demo@rhythmix.com')) {
          users.push({ ...demoUser, password: 'demo' });
          localStorage.setItem('rhythmix_users', JSON.stringify(users));
        }
        data = demoUser;
      }

      localStorage.setItem('rhythmix_session', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#07070a] flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/0 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-violet-600/10 to-pink-500/0 blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Music2 size={24} color="#fff" />
          </div>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-3xl tracking-tight mt-2">
            Rhythmix
          </h1>
          <p className="text-white/45 text-sm font-medium">
            {isSignUp ? 'Create your profile to start listening' : 'Welcome back! Log in to access your playlist'}
          </p>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="text-rose-400 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/5 focus:border-cyan-500/50 text-white placeholder-white/30 text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-white/60 text-xs font-bold uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/5 focus:border-cyan-500/50 text-white placeholder-white/30 text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/60 text-xs font-bold uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/5 focus:border-cyan-500/50 text-white placeholder-white/30 text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-tr from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 disabled:from-cyan-800 disabled:to-violet-950 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-white/5" />
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">OR CONTINUE WITH</span>
          <div className="flex-1 h-[1px] bg-white/5" />
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={handleDemoLogin}
            className="flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-white/80 hover:text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <Chrome size={14} className="text-cyan-400" />
            <span>Demo Session</span>
          </button>
          <button 
            type="button"
            onClick={handleDemoLogin}
            className="flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-white/80 hover:text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <Github size={14} className="text-violet-400" />
            <span>GitHub login</span>
          </button>
        </div>

        {/* Toggle Form Tab Link */}
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-cyan-400/90 hover:text-cyan-300 text-xs font-semibold hover:underline transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account yet? Sign Up"}
          </button>
        </div>

        {/* Developer Credit Signature */}
        <div className="flex flex-col items-center justify-center border-t border-white/5 pt-4 mt-2 opacity-35">
          <p className="text-white text-[10px]">© 2026 Rhythmix</p>
          <p className="text-white text-[9px] font-bold tracking-wider uppercase mt-0.5">By Kathir Junior Developer</p>
        </div>

      </div>
    </div>
  );
}
