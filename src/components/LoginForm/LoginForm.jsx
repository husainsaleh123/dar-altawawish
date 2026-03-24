// src/components/LoginForm/LoginForm.jsx

import { useCallback, useEffect, useRef, useState } from 'react';
import * as usersService from '../../utilities/users-service';
import styles from './LoginForm.module.scss';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export default function LoginForm({ setUser, onSwitchToSignUp, embedded = false }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const googleButtonRef = useRef(null);

  const handleGoogleCredential = useCallback(async (response) => {
    const credential = response?.credential;
    if (!credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    try {
      setIsSubmittingGoogle(true);
      const user = await usersService.googleLogin({ credential });
      setUser(user);
      setError('');
    } catch (err) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setIsSubmittingGoogle(false);
    }
  }, [setUser]);

  useEffect(() => {
    let mounted = true;

    async function loadGoogleConfig() {
      try {
        const cfg = await usersService.getGoogleConfig();
        if (!mounted) return;
        setGoogleClientId(String(cfg?.googleClientId || '').trim());
      } catch {
        if (!mounted) return;
        setGoogleClientId('');
        setIsGoogleReady(false);
      }
    }

    loadGoogleConfig();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!googleClientId) {
      setIsGoogleReady(false);
      return;
    }

    let script = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

    const initGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential
      });

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: googleButtonRef.current.offsetWidth || 520
      });

      setIsGoogleReady(true);
    };

    if (!script) {
      script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      script.onerror = () => {
        setIsGoogleReady(false);
        setError('Unable to load Google sign-in.');
      };
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  }, [googleClientId, handleGoogleCredential]);

  function handleChange(evt) {
    const { name, value } = evt.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: name === 'email' ? value.trimStart().toLowerCase() : value
    }));
    setError('');
  }

  async function handleSubmit(evt) {
    // Prevent form from being submitted to the server
    evt.preventDefault();
    try {
      // The promise returned by the login service method
      // will resolve to the user object included in the
      // payload of the JSON Web Token (JWT)
      const user = await usersService.login(credentials);
      setUser(user);
    } catch (err) {
      setError(err?.message || 'Log In Failed - Try Again');
    }
  }

  function handleGoogleShellClick() {
    if (!googleClientId) {
      setError('Google sign-in is not configured yet.');
      return;
    }

    if (googleButtonRef.current) {
      const clickable = googleButtonRef.current.querySelector('div[role="button"], iframe');
      if (clickable instanceof HTMLElement) {
        clickable.click();
        return;
      }

      googleButtonRef.current.click();
    }
  }

  return (
    <section className={`${styles.loginSection} ${embedded ? styles.embedded : ''}`.trim()}>
      <div className={styles.loginHeader}>
        <h2>Log in</h2>
        <p>Use your email address or continue with Google.</p>
      </div>

      <div className={styles.googleButtonWrap}>
        <div className={styles.googleButtonShell}>
          <button
            type="button"
            className={`${styles.googleVisualButton} ${!googleClientId || isSubmittingGoogle ? styles.googleVisualButtonDisabled : ''}`.trim()}
            onClick={handleGoogleShellClick}
            disabled={!googleClientId || isSubmittingGoogle}
          >
            <span className={styles.googleIconBadge}>
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#EA4335" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
                <path fill="#4285F4" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.31-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.98 10.72A5.4 5.4 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.02-2.33Z" />
                <path fill="#34A853" d="M9 3.58c1.32 0 2.5.45 3.44 1.33l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.02 2.33c.71-2.12 2.68-3.7 5.02-3.7Z" />
              </svg>
            </span>
            <span className={styles.googleButtonText}>
              {isSubmittingGoogle ? 'Signing in with Google...' : 'Continue with Google'}
            </span>
          </button>
          <div
            ref={googleButtonRef}
            className={`${styles.googleNativeButton} ${isGoogleReady ? styles.googleNativeButtonReady : ''}`.trim()}
          />
        </div>
      </div>

      <p className={styles.orText}>Or</p>

      <form autoComplete="off" onSubmit={handleSubmit} className={styles.loginForm}>
        <label className={styles.fieldBlock}>
          <span>Email</span>
          <input type="email" name="email" value={credentials.email} onChange={handleChange} required />
        </label>

        <label className={styles.fieldBlock}>
          <span>Password</span>
          <input type="password" name="password" value={credentials.password} onChange={handleChange} required />
        </label>

        <p className={styles.errorText}>{error || '\u00A0'}</p>

        <button type="submit" className={styles.submitButton}>
          Log In
        </button>
      </form>

      {onSwitchToSignUp ? (
        <p className={styles.switchText}>
          Need an account?{' '}
          <button type="button" onClick={onSwitchToSignUp} className={styles.switchButton}>
            Sign up
          </button>
        </p>
      ) : null}
    </section>
  );
}
