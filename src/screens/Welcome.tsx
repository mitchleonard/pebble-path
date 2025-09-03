import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile, getUserProfile, updateLastLogin } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      checkUserProfile();
    }
  }, [user]);

  async function checkUserProfile() {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        // Existing user - update last login and go to home
        await updateLastLogin(user.uid);
        navigate('/');
      } else {
        // New user - show first name input
        setIsNewUser(true);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setError('Error checking user profile. Please try again.');
    }
  }

  async function handleFirstNameSubmit() {
    if (!firstName.trim() || !user) return;
    
    setLoading(true);
    try {
      await createUserProfile(user.uid, firstName.trim());
      await updateLastLogin(user.uid);
      navigate('/');
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Error creating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneSignIn() {
    if (!phoneNumber.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      // Format phone number to E.164
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+1' + formattedPhone.replace(/\D/g, '');
      }
      
      // Initialize reCAPTCHA
      let recaptchaVerifier = (window as any).recaptchaVerifier;
      if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
        });
        (window as any).recaptchaVerifier = recaptchaVerifier;
      }
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setShowVerification(true);
      setShowPhoneInput(false);
    } catch (error: any) {
      console.error('Phone sign-in error:', error);
      if (error.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please check and try again.');
      } else {
        setError('Phone sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerificationCode() {
    if (!verificationCode.trim() || !confirmationResult) return;
    
    setLoading(true);
    setError('');
    try {
      // Confirm the verification code with Firebase
      await confirmationResult.confirm(verificationCode);
      
      // Clear the UI
      setShowVerification(false);
      setShowPhoneInput(false);
      setVerificationCode('');
      setConfirmationResult(null);
      
      // The user will now be automatically signed in via Firebase
      // The useEffect will detect the user change and handle the flow
    } catch (error: any) {
      console.error('Verification error:', error);
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // If user is authenticated and we're checking their profile
  if (user && isNewUser === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-lilac/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and is new, show first name input
  if (user && isNewUser) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-lilac/30">
        <div className="card p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="size-16 rounded-2xl bg-primary/90 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-primary mb-2">Welcome to Pebble Path!</h1>
            <p className="text-slate-600">Let's get to know you better</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                What's your first name?
              </label>
              <input
                id="firstName"
                type="text"
                className="input w-full"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFirstNameSubmit()}
                autoFocus
              />
            </div>
            
            {error && <p className="text-red-600 text-sm">{error}</p>}
            
            <button
              className="btn btn-primary w-full"
              onClick={handleFirstNameSubmit}
              disabled={!firstName.trim() || loading}
            >
              {loading ? 'Setting up...' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default welcome screen for unauthenticated users
  return (
    <div className="min-h-dvh flex items-center justify-center bg-lilac/30">
      <div className="card p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl bg-primary/90 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-primary mb-2">Pebble Path</h1>
          <p className="text-slate-600">Your daily check-in buddy</p>
        </div>
        
        <div className="space-y-4">
          <button
            className="btn btn-primary w-full flex items-center justify-center gap-3"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">or</span>
            </div>
          </div>
          
          <button
            className="btn bg-lilac/60 hover:bg-lilac w-full"
            onClick={() => setShowPhoneInput(true)}
            disabled={loading}
          >
            Continue with Phone
          </button>
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </div>
        
        {/* Phone number input */}
        {showPhoneInput && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <div className="space-y-3">
              <input
                type="tel"
                className="input w-full"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePhoneSignIn()}
              />
              <div className="flex gap-2">
                <button
                  className="btn btn-primary flex-1"
                  onClick={handlePhoneSignIn}
                  disabled={!phoneNumber.trim() || loading}
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
                <button
                  className="btn bg-slate-200 hover:bg-slate-300"
                  onClick={() => setShowPhoneInput(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Verification code input */}
        {showVerification && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <div className="space-y-3">
              <input
                type="text"
                className="input w-full"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerificationCode()}
                maxLength={6}
              />
              <div className="flex gap-2">
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleVerificationCode}
                  disabled={!verificationCode.trim() || loading}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  className="btn bg-slate-200 hover:bg-slate-300"
                  onClick={() => setShowVerification(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}



