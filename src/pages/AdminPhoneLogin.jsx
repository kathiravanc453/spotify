import { useState, useRef, useEffect } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { auth } from '../firebase';
import { Phone, ShieldCheck, ArrowRight, Music2, Loader2, RefreshCw } from 'lucide-react';

const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || '';

export default function AdminPhoneLogin({ onAdminVerified }) {
  const [step, setStep]             = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone]           = useState('');
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmResult, setConfirmResult] = useState(null);
  const recaptchaRef  = useRef(null);
  const otpRefs       = useRef([]);
  const timerRef      = useRef(null);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  // Initialize invisible reCAPTCHA
  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
    return recaptchaRef.current;
  };

  // Format phone: user can type 10-digit Indian number, we add +91
  const formatPhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    const fullPhone = formatPhone(phone);

    // Guard: only allow the registered admin number
    if (ADMIN_PHONE && fullPhone !== ADMIN_PHONE) {
      setError('This number is not registered as an admin. Access denied.');
      return;
    }

    setLoading(true);
    try {
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmResult(result);
      setStep('otp');
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err) {
      console.error(err);
      // Reset reCAPTCHA on failure
      recaptchaRef.current = null;
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please enter a valid Indian mobile number.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last char
    setOtp(newOtp);
    // Auto-advance
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    // Auto-verify when all 6 digits filled
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code) => {
    if (!confirmResult) return;
    setError('');
    setLoading(true);
    try {
      const result = await confirmResult.confirm(code);
      const user = result.user;
      // Grant admin session
      const session = {
        name: 'Admin',
        phone: user.phoneNumber,
        role: 'admin',
        uid: user.uid,
      };
      localStorage.setItem('rhythmix_admin_session', JSON.stringify(session));
      onAdminVerified(session);
    } catch (err) {
      console.error(err);
      setError('Incorrect OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    await verifyOTP(otp.join(''));
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    setStep('phone');
    setConfirmResult(null);
    recaptchaRef.current = null;
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#07070a] flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/0 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-violet-600/10 to-pink-500/0 blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '11s' }} />

      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-sm bg-white/[0.025] border border-white/8 backdrop-blur-2xl rounded-3xl p-7 shadow-2xl flex flex-col gap-6">

        {/* Brand */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Music2 size={26} color="#fff" />
          </div>
          <h1 className="text-white font-extrabold text-2xl tracking-tight mt-1">Rhythmix Admin</h1>
          <p className="text-white/40 text-xs font-medium">
            {step === 'phone' ? 'Enter your registered admin mobile number' : 'Enter the 6-digit OTP sent to your phone'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center">
          {['phone', 'otp'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-500 ${
                step === s
                  ? 'bg-gradient-to-tr from-cyan-400 to-violet-500 text-white shadow-md shadow-cyan-500/20'
                  : s === 'otp' && step === 'otp'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-white/30 border border-white/10'
              }`}>
                {i + 1}
              </div>
              {i === 0 && <div className={`w-8 h-[2px] rounded-full transition-all duration-500 ${step === 'otp' ? 'bg-cyan-400/60' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 text-rose-400 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl">
            <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* ── Step 1: Phone number ─────────────────────────────────── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest pl-1">
                Admin Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <div className="absolute left-11 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold border-r border-white/10 pr-2.5 mr-1">+91</div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  required
                  autoFocus
                  className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.07] border border-white/8 focus:border-cyan-500/50 text-white placeholder-white/20 text-sm rounded-2xl pl-24 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 font-semibold tracking-widest"
                />
              </div>
              <p className="text-white/25 text-[10px] pl-1">Only registered admin numbers are allowed.</p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full bg-gradient-to-tr from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/15 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : <><Phone size={15} /><span>Send OTP</span><ArrowRight size={15} /></>
              }
            </button>
          </form>
        )}

        {/* ── Step 2: OTP verification ─────────────────────────────── */}
        {step === 'otp' && (
          <form onSubmit={handleVerify} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest pl-1 text-center">
                Enter OTP sent to +91{phone}
              </label>

              {/* 6-box OTP input */}
              <div className="flex gap-2.5 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`w-11 h-13 text-center text-xl font-extrabold rounded-xl border transition-all duration-300 focus:outline-none bg-white/[0.05] text-white
                      ${digit
                        ? 'border-cyan-400/60 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                        : 'border-white/10 focus:border-cyan-400/50 focus:bg-white/[0.08]'
                      }`}
                    style={{ height: '52px' }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.some(d => d === '')}
              className="w-full bg-gradient-to-tr from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/15 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : <><ShieldCheck size={15} /><span>Verify & Login</span></>
              }
            </button>

            {/* Resend */}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="flex items-center justify-center gap-1.5 text-white/30 hover:text-white/60 text-xs font-semibold transition-colors disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} className={resendTimer > 0 ? '' : 'hover:rotate-180 transition-transform duration-500'} />
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="border-t border-white/5 pt-4 text-center opacity-30">
          <p className="text-white text-[9px] font-bold tracking-wider uppercase">© 2026 Rhythmix · By Kathir Junior Developer</p>
        </div>
      </div>
    </div>
  );
}
