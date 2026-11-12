import React, { useState } from 'react';
import { Lock, Fingerprint, Delete, KeyRound, AlertCircle, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { isBiometricsAvailable, authenticateWithBiometrics } from '../utils/crypto';

interface PinLockScreenProps {
  email: string;
  fullName: string;
  biometricEnabled: boolean;
  onUnlocked: () => void;
  onLogout: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  email,
  fullName,
  biometricEnabled,
  onUnlocked,
  onLogout,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);

  // Forgot PIN state
  const [showForgotPin, setShowForgotPin] = useState<boolean>(false);
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [newPinConfirm, setNewPinConfirm] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<string>('');

  const handleDigit = (digit: string) => {
    if (isVerifying || isLockedOut) return;
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 6) {
        verifyPinCode(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (isVerifying || isLockedOut) return;
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    if (isVerifying || isLockedOut) return;
    setPin('');
    setError('');
  };

  const verifyPinCode = async (pinToTest: string) => {
    setIsVerifying(true);
    setError('');
    try {
      await api.verifyPin(email, pinToTest);
      onUnlocked();
    } catch (err: any) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setPin('');
      if (nextAttempts >= 5) {
        setIsLockedOut(true);
        setError('Maximum PIN attempts reached. Vault locked for security. Please try again in 1 minute or reset your PIN below.');
        setTimeout(() => {
          setIsLockedOut(false);
          setAttempts(0);
          setError('');
        }, 60000);
      } else {
        setError(`Incorrect 6-digit PIN. (${5 - nextAttempts} attempt${5 - nextAttempts === 1 ? '' : 's'} remaining)`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBiometricUnlock = async () => {
    setIsVerifying(true);
    setError('');
    try {
      const available = await isBiometricsAvailable();
      const verified = await authenticateWithBiometrics();
      if (verified) {
        await api.verifyBiometric(email);
        onUnlocked();
      } else {
        setError('Biometric authentication could not be completed. Please enter your 6-digit PIN.');
      }
    } catch (err: any) {
      setError(err.message || 'Biometric unlock failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');

    if (!masterPassword) {
      setError('Please enter your account master password.');
      return;
    }
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setError('New Vault PIN must be exactly 6 digits.');
      return;
    }
    if (newPin !== newPinConfirm) {
      setError('New PIN and confirmation PIN do not match.');
      return;
    }

    setIsVerifying(true);
    try {
      await api.resetPin(email, masterPassword, newPin);
      setResetSuccess('PIN updated! Unlocking your vault...');
      setTimeout(() => {
        onUnlocked();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset PIN. Check your master password.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F4F5F7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#171A20] border border-[#222630] rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#648BFF] via-[#648BFF]/50 to-transparent" />

        {!showForgotPin ? (
          <>
            {/* Lock Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[#648BFF] mb-4 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-[#F4F5F7] text-center">
              DocuVault Locked
            </h2>
            <p className="text-xs text-[#9299A5] text-center mt-1">
              {fullName} · {email}
            </p>
            <p className="text-xs text-[#C5CAD3] mt-3 font-medium">
              Enter 6-digit Vault PIN
            </p>

            {/* PIN Dots Display */}
            <div className="flex items-center gap-3 my-5">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                      isFilled
                        ? 'bg-[#648BFF] scale-110 shadow-[0_0_10px_rgba(100,139,255,0.6)]'
                        : 'bg-[#222630] border border-[#2D3342]'
                    }`}
                  />
                );
              })}
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-2.5 rounded-xl mb-4 w-full text-center justify-center">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full mb-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDigit(num)}
                  disabled={isVerifying || isLockedOut}
                  className="h-13 rounded-2xl bg-[#222630]/80 hover:bg-[#222630] active:scale-95 border border-[#2D3342] text-xl font-semibold text-[#F4F5F7] transition-all flex items-center justify-center disabled:opacity-40"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                disabled={isVerifying || isLockedOut || pin.length === 0}
                className="h-13 rounded-2xl bg-transparent hover:bg-[#222630]/40 text-xs font-medium text-[#9299A5] hover:text-[#C5CAD3] transition-all flex items-center justify-center disabled:opacity-30"
              >
                Clear
              </button>
              <button
                onClick={() => handleDigit('0')}
                disabled={isVerifying || isLockedOut}
                className="h-13 rounded-2xl bg-[#222630]/80 hover:bg-[#222630] active:scale-95 border border-[#2D3342] text-xl font-semibold text-[#F4F5F7] transition-all flex items-center justify-center disabled:opacity-40"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                disabled={isVerifying || isLockedOut || pin.length === 0}
                className="h-13 rounded-2xl bg-transparent hover:bg-[#222630]/40 text-[#9299A5] hover:text-rose-400 transition-all flex items-center justify-center disabled:opacity-30"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Forgot PIN Link */}
            <div className="w-full text-center my-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPin(true);
                  setError('');
                }}
                className="text-xs text-[#648BFF] hover:underline font-medium"
              >
                Forgot Vault PIN?
              </button>
            </div>

            {/* Biometrics Action (if enabled) */}
            {biometricEnabled && (
              <button
                onClick={handleBiometricUnlock}
                disabled={isVerifying || isLockedOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-3 rounded-xl bg-[#222630] hover:bg-[#2D3342] border border-[#2D3342] text-xs font-medium text-[#648BFF] transition-all active:scale-98"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Unlock with Biometrics</span>
              </button>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between w-full pt-3 border-t border-[#222630] text-xs text-[#9299A5]">
              <span className="flex items-center gap-1 text-[11px]">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Encrypted session</span>
              </span>
              <button
                onClick={onLogout}
                className="hover:text-rose-400 transition-colors font-medium text-xs px-2 py-1 rounded-lg hover:bg-rose-500/10"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          /* Forgot / Reset PIN View */
          <div className="w-full space-y-4">
            <button
              onClick={() => {
                setShowForgotPin(false);
                setError('');
                setResetSuccess('');
              }}
              className="flex items-center gap-1.5 text-xs text-[#9299A5] hover:text-[#F4F5F7] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to PIN keypad</span>
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[#648BFF] mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F5F7]">Reset Vault PIN</h3>
              <p className="text-xs text-[#9299A5] mt-1">
                Authenticate with your master password to establish a new 6-digit vault PIN.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[#C5CAD3] block mb-1 font-medium">Master Password</label>
                <input
                  type="password"
                  required
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Account Master Password"
                  className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
                />
              </div>

              <div>
                <label className="text-[#C5CAD3] block mb-1 font-medium">New 6-Digit PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] font-mono tracking-widest text-center focus:outline-none focus:border-[#648BFF]"
                />
              </div>

              <div>
                <label className="text-[#C5CAD3] block mb-1 font-medium">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={newPinConfirm}
                  onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-[#0B0D10] border border-[#2D3342] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] font-mono tracking-widest text-center focus:outline-none focus:border-[#648BFF]"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || newPin.length !== 6 || newPin !== newPinConfirm}
                className="w-full h-10 rounded-xl bg-[#648BFF] hover:bg-[#5279f0] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 shadow-md shadow-[#648BFF]/20 mt-2"
              >
                {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Set New PIN & Unlock'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
