import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, KeyRound, User, Fingerprint, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, setUserSession } from '../services/api';
import { UserProfile } from '../types';

interface AuthModalProps {
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot'>('login');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Verification & reset
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName || !email || !password || !pin) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters with high entropy.');
      return;
    }
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError('Vault PIN must be exactly 6 digits.');
      return;
    }
    if (pin !== pinConfirm) {
      setError('PIN and confirmation PIN do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        fullName,
        email,
        password,
        pin,
        biometricEnabled,
      });

      if (res.user) {
        setUserSession(res.user.email, res.user.fullName);
        onAuthenticated(res.user);
      } else {
        const loginRes = await api.login(email, password);
        setUserSession(loginRes.user.email, loginRes.user.fullName);
        onAuthenticated(loginRes.user);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.login('siriilu21@gmail.com', 'Password123!');
      setUserSession(res.user.email, 'Shirisha');
      onAuthenticated({
        ...res.user,
        fullName: 'Shirisha',
      });
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await api.verifyEmail(email, otpCode);
      setSuccessMsg('Email verified successfully! You can now log in to your private vault.');
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.resendOtp(email);
      setDevOtpHint(res.devVerificationCode || null);
      setSuccessMsg('A new verification code has been dispatched.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(email, password);
      setUserSession(res.user.email, res.user.fullName);
      onAuthenticated(res.user);
    } catch (err: any) {
      if (err.message && err.message.includes('verify your email')) {
        setMode('verify');
        setError(err.message);
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setDevOtpHint(res.devResetCode || null);
      setSuccessMsg('Password reset code generated.');
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !newPassword) {
      setError('Provide reset code and new password.');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(email, otpCode, newPassword);
      setSuccessMsg('Password reset successfully. Please log in.');
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F4F5F7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#171A20] border border-[#222630] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[#648BFF] mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F7]">DocuVault</h1>
          <p className="text-xs text-[#9299A5] mt-1 text-center">
            AI-Powered Privacy-First Personal Digital Document Wallet
          </p>
        </div>

        {/* Tab Switcher (Login vs Register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex p-1 bg-[#0B0D10] rounded-xl border border-[#222630] mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-[#222630] text-[#F4F5F7] shadow-sm' : 'text-[#9299A5] hover:text-[#C5CAD3]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register' ? 'bg-[#222630] text-[#F4F5F7] shadow-sm' : 'text-[#9299A5] hover:text-[#C5CAD3]'
              }`}
            >
              Create Vault
            </button>
          </div>
        )}

        {/* Alert Notifications */}
        {error && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs p-3 rounded-xl mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Development verification helper banner */}
        {devOtpHint && (
          <div className="bg-[#222630] border border-[#648BFF]/30 p-2.5 rounded-xl mb-4 text-xs text-[#C5CAD3] flex items-center justify-between">
            <span>Dispatched Code: <strong className="font-mono text-[#648BFF] tracking-wider text-sm">{devOtpHint}</strong></span>
            <button
              type="button"
              onClick={() => setOtpCode(devOtpHint)}
              className="text-[11px] text-[#648BFF] hover:underline"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* Mode: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#C5CAD3] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9299A5] absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#F4F5F7] placeholder-[#9299A5]/60 focus:outline-none focus:border-[#648BFF]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#C5CAD3]">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#648BFF] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9299A5] absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#F4F5F7] placeholder-[#9299A5]/60 focus:outline-none focus:border-[#648BFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#648BFF] hover:bg-[#5279f0] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#648BFF]/20 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Unlock Personal Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#222630]"></div>
              <span className="flex-shrink mx-3 text-[11px] text-[#9299A5]">or instant evaluation</span>
              <div className="flex-grow border-t border-[#222630]"></div>
            </div>

            {/* Quick Demo Login */}
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full h-10 rounded-xl bg-[#222630] hover:bg-[#2D3342] text-xs font-semibold text-[#F4F5F7] flex items-center justify-center gap-2 transition-all border border-[#2D3342]"
            >
              <span>1-Click Test: Sign in as Shirisha (siriilu21@gmail.com)</span>
            </button>
          </form>
        )}

        {/* Multi-User Privacy Banner */}
        <div className="mt-5 p-3.5 bg-[#0B0D10] border border-[#222630] rounded-2xl text-left">
          <div className="flex items-center gap-1.5 text-[#648BFF] text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-User Isolated Vaults</span>
          </div>
          <p className="text-[11px] text-[#9299A5] leading-relaxed">
            Every registered user receives their own completely fresh, private personal vault. Upload and store your college certificates, marksheets, degrees, government IDs, and records with AES-256 encryption.
          </p>
        </div>

        {/* Mode: Register */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#C5CAD3] mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9299A5] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl pl-9 pr-3 py-2 text-sm text-[#F4F5F7] placeholder-[#9299A5]/60 focus:outline-none focus:border-[#648BFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5CAD3] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9299A5] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.morgan@cyber.org"
                  className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl pl-9 pr-3 py-2 text-sm text-[#F4F5F7] placeholder-[#9299A5]/60 focus:outline-none focus:border-[#648BFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5CAD3] mb-1">Vault Master Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9299A5] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl pl-9 pr-3 py-2 text-sm text-[#F4F5F7] placeholder-[#9299A5]/60 focus:outline-none focus:border-[#648BFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#C5CAD3] mb-1">6-Digit PIN</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#9299A5] absolute left-3 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl pl-9 pr-2 py-2 text-sm text-[#F4F5F7] font-mono tracking-widest focus:outline-none focus:border-[#648BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C5CAD3] mb-1">Confirm PIN</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#9299A5] absolute left-3 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl pl-9 pr-2 py-2 text-sm text-[#F4F5F7] font-mono tracking-widest focus:outline-none focus:border-[#648BFF]"
                  />
                </div>
              </div>
            </div>

            {/* Biometric Enrollment Option */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0D10] border border-[#2D3342]">
              <div className="flex items-center gap-2.5">
                <Fingerprint className="w-5 h-5 text-[#648BFF]" />
                <div>
                  <p className="text-xs font-medium text-[#F4F5F7]">Enable Biometrics</p>
                  <p className="text-[10px] text-[#9299A5]">Fast unlock via device sensor</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => setBiometricEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#648BFF] rounded"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#648BFF] hover:bg-[#5279f0] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#648BFF]/20 disabled:opacity-50 mt-1"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Private Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Mode: Email OTP Verification */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <p className="text-xs text-[#C5CAD3] text-center">
              Enter the 6-digit verification code sent to <strong className="text-[#F4F5F7]">{email}</strong>.
            </p>

            <div>
              <label className="block text-xs font-medium text-[#C5CAD3] mb-1.5 text-center">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="654321"
                className="w-full text-center tracking-[0.5em] text-xl font-mono bg-[#0B0D10] border border-[#2D3342] rounded-xl py-3 text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full h-11 rounded-xl bg-[#648BFF] hover:bg-[#5279f0] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm & Verify Vault'}
            </button>

            <div className="flex items-center justify-between text-xs text-[#9299A5] pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                className="hover:text-[#648BFF] transition-colors"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="hover:text-[#F4F5F7] transition-colors"
              >
                Back to Sign in
              </button>
            </div>
          </form>
        )}

        {/* Mode: Forgot Password */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <p className="text-xs text-[#C5CAD3] text-center">
              Request a secure password reset code for your vault.
            </p>

            <div>
              <label className="block text-xs font-medium text-[#C5CAD3] mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
              />
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading || !email}
              className="w-full h-10 rounded-xl bg-[#222630] hover:bg-[#2D3342] text-xs font-semibold text-[#F4F5F7] flex items-center justify-center transition-all disabled:opacity-50"
            >
              Generate Reset Code
            </button>

            {devOtpHint && (
              <form onSubmit={handleResetPassword} className="space-y-3 pt-2 border-t border-[#222630]">
                <div>
                  <label className="block text-xs font-medium text-[#C5CAD3] mb-1">Reset Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7] font-mono tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C5CAD3] mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-xl bg-[#648BFF] text-white text-xs font-semibold flex items-center justify-center"
                >
                  Update Vault Password
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#9299A5] hover:text-[#F4F5F7]"
              >
                Return to Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
