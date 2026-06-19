import { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Music2, Loader2, UserPlus } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@rhythmix.com';

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp]       = useState(false);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [info, setInfo]               = useState('');
  const [resetStep, setResetStep]     = useState(0); // 0=login, 1=otp, 2=new pass
  const [otpCode, setOtpCode]         = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address first to reset your password.');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);
    try {
      const sendOtpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const sendOtpData = await sendOtpRes.json();
      if (!sendOtpRes.ok) throw new Error(sendOtpData.error);
      
      setInfo('A 6-digit code has been sent to your email!');
      setResetStep(1); // Move to OTP entry step
    } catch (err) {
      console.error('Send OTP Error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (resetStep === 1) {
      if (!otpCode || otpCode.length < 6) {
        setError('Please enter the 6-digit verification code.');
        return;
      }
      setError('');
      setInfo('Code accepted! Please enter your new password.');
      setResetStep(2); // Move to new password step
      return;
    }

    if (resetStep === 2) {
      if (!newPassword || newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      
      setError('');
      setLoading(true);
      try {
        const resetRes = await fetch('/api/auth/verify-otp-and-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: otpCode, newPassword })
        });
        const resetData = await resetRes.json();
        if (!resetRes.ok) throw new Error(resetData.error);
        
        setInfo('Success! Password instantly reset. You can now log in.');
        setResetStep(0); // Back to login
        setPassword('');
        setOtpCode('');
        setNewPassword('');
      } catch (err) {
        console.error('Password Reset Error:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const finalizeLogin = (user) => {
    // Check if the logged-in email matches the admin email
    const isSystemAdmin = user.email === ADMIN_EMAIL;
    
    const sessionData = {
      name: isSystemAdmin ? 'Admin' : user.email.split('@')[0],
      email: user.email,
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email)}`,
      role: isSystemAdmin ? 'admin' : 'user',
      uid: user.uid,
      loggedInAt: Date.now(),
    };

    localStorage.setItem('rhythmix_session', JSON.stringify(sessionData));
    
    if (isSystemAdmin) {
      localStorage.setItem('rhythmix_admin_session', JSON.stringify(sessionData));
    }
    
    onLogin(sessionData);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // ─── DEVELOPER TESTING MODE OVERRIDE ───
      if (password === 'DEV_OVERRIDE') {
        const generatedName = email.split('@')[0];
        const isSystemAdmin = email === ADMIN_EMAIL;
        const mockUser = {
          email: email,
          uid: 'dev_override_mock_uid_' + Date.now(),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        };
        setInfo('Developer Mode: Successfully bypassed Firebase Auth!');
        setTimeout(() => finalizeLogin(mockUser), 1000);
        return;
      }
      // ───────────────────────────────────────

      if (!auth) {
        throw new Error('Firebase Auth is not properly initialized. Check your .env file!');
      }

      let userCredential;
      const generatedName = email.split('@')[0];
      const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`;
      const isSystemAdmin = email === ADMIN_EMAIL;

      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        
        // 1. Update Firebase Auth Profile
        await updateProfile(fbUser, { displayName: generatedName, photoURL: generatedAvatar });

        // 2. Save User to Cloud Firestore Database (Non-blocking)
        if (db) {
          setDoc(doc(db, "users", fbUser.uid), {
            name: isSystemAdmin ? 'Admin' : generatedName,
            email: fbUser.email,
            avatar: generatedAvatar,
            role: isSystemAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          }).catch(err => console.error("Firestore Error (Did you create the database?):", err));
        }
      } else {
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
          const fbUser = userCredential.user;
          finalizeLogin({
            email: fbUser.email,
            uid: fbUser.uid,
            avatar: fbUser.photoURL,
          });
          return;
        } catch (firebaseErr) {
          console.error("Firebase Login Error:", firebaseErr);
          throw new Error("Invalid email or password");
        }
      }
    } catch (err) {
      console.error('Firebase Auth Error:', err);
      // Clean up Firebase error codes for users
      const cleanMessage = err.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : err.message;
      setError(`Error: ${cleanMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#07070a] flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/0 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-violet-600/10 to-pink-500/0 blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '11s' }} />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-sm bg-white/[0.025] border border-white/8 backdrop-blur-2xl rounded-3xl p-7 shadow-2xl flex flex-col gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            {resetStep > 0 ? <ShieldCheck size={26} color="#fff" /> : <Music2 size={26} color="#fff" />}
          </div>
          <h1 className="text-white font-extrabold text-2xl tracking-tight mt-1">
            {resetStep > 0 ? 'Password Reset' : 'Rhythmix'}
          </h1>
          <p className="text-white/40 text-xs font-medium">
            {resetStep === 1 && 'Enter the code sent to your email'}
            {resetStep === 2 && 'Choose a strong new password'}
            {resetStep === 0 && (isSignUp ? 'Create a new account' : 'Log in to your account')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 text-rose-400 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl">
            <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Info / Success */}
        {info && (
          <div className="flex items-start gap-2.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl">
            <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
            {info}
          </div>
        )}
        {/* Form Area */}
        <div className="flex flex-col gap-4">
          {resetStep === 0 ? (
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              
              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.07] border border-white/8 focus:border-cyan-500/50 text-white placeholder-white/20 text-base md:text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 font-semibold"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest pl-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.07] border border-white/8 focus:border-cyan-500/50 text-white placeholder-white/20 text-base md:text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 font-semibold"
                  />
                </div>
                {!isSignUp && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-cyan-400/50 font-medium">Type "DEV_OVERRIDE" to force login</span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[10px] text-white/40 hover:text-cyan-400 font-bold transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-tr from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/15 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer mt-2"
              >
                {loading
                  ? <Loader2 size={18} className="animate-spin" />
                  : isSignUp 
                    ? <><UserPlus size={15} /><span>Sign Up</span></>
                    : <><ArrowRight size={15} /><span>Log In</span></>
                }
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndReset} className="flex flex-col gap-4">
              {resetStep === 1 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest pl-1">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      required
                      className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.07] border border-white/8 focus:border-cyan-500/50 text-white placeholder-white/20 text-base md:text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 font-semibold text-center tracking-widest"
                    />
                  </div>
                </div>
              )}
              
              {resetStep === 2 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest pl-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.07] border border-white/8 focus:border-cyan-500/50 text-white placeholder-white/20 text-base md:text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 font-semibold"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (resetStep === 1 && otpCode.length < 6) || (resetStep === 2 && newPassword.length < 6)}
                className="mt-2 w-full bg-gradient-to-tr from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {resetStep === 1 ? <span>Verify Code</span> : <span>Set Password</span>}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetStep(0);
                  setError('');
                  setInfo('');
                }}
                className="text-white/30 hover:text-white/70 text-[10px] font-bold transition-colors w-full text-center uppercase tracking-widest"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
        {/* Toggle Sign Up / Log In */}
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs font-semibold text-white/40 hover:text-cyan-400 transition-colors"
          >
            {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-4 text-center opacity-30 mt-2">
          <p className="text-white text-[9px] font-bold tracking-wider uppercase">© 2026 Rhythmix · By Kathir Junior Developer</p>
        </div>
      </div>
    </div>
  );
}
