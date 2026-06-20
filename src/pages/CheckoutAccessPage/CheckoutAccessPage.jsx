import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CheckoutAccessPage.module.scss';
import * as usersService from '../../utilities/users-service';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export default function CheckoutAccessPage({ setUser, user }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const googleButtonRef = useRef(null);

  const isLoginDisabled = useMemo(() => {
    return !credentials.email.trim() || !credentials.password;
  }, [credentials]);

  const handleGoogleCredential = useCallback(async (response) => {
    const credential = response?.credential;
    if (!credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    try {
      setIsSubmittingGoogle(true);
      const loggedInUser = await usersService.googleLogin({ credential });
      setUser?.(loggedInUser);
      setError('');
      navigate('/checkout', { state: { checkoutMode: 'logged-in' } });
    } catch (err) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setIsSubmittingGoogle(false);
    }
  }, [navigate, setUser]);

  useEffect(() => {
    if (user) {
      navigate('/checkout', { replace: true, state: { checkoutMode: 'logged-in' } });
    }
  }, [navigate, user]);

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
        width: googleButtonRef.current.offsetWidth || 460
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

  function handleContinueAsGuest() {
    navigate('/checkout', { state: { checkoutMode: 'guest' } });
  }

  function handleChange(evt) {
    setCredentials((prev) => ({ ...prev, [evt.target.name]: evt.target.value }));
    setError('');
  }

  async function handleLogin(evt) {
    evt.preventDefault();
    try {
      const loggedInUser = await usersService.login(credentials);
      setUser?.(loggedInUser);
      navigate('/checkout', { state: { checkoutMode: 'logged-in' } });
    } catch {
      setError('Login failed. Please check your email and password.');
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

  if (user) return null;

  return (
    <main className={styles.CheckoutAccessPage}>
      <section className={styles.grid}>
        <article className={styles.newCustomer}>
          <h1>New Customer!</h1>
          <p>
            You do not need to create an account to place an order. Choose guest checkout,
            or create a new account for faster ordering next time.
          </p>

          <button type="button" className={styles.primaryAction} onClick={handleContinueAsGuest}>
            Continue as guest
          </button>

          <span className={styles.separator}>or</span>

          <Link className={styles.secondaryAction} to="/signup">
            Create new account
          </Link>
        </article>

        <article className={styles.returningCustomer}>
          <h2>Login</h2>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Email"
              autoComplete="email"
              required
            />
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <button type="submit" disabled={isLoginDisabled} className={styles.loginButton}>
              Login
            </button>
          </form>
          <p className={styles.errorText}>{error || '\u00A0'}</p>
          <div className={styles.loginSeparator}>or</div>
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
                <span>{isSubmittingGoogle ? 'Signing in with Google...' : 'Continue with Google'}</span>
              </button>
              <div
                ref={googleButtonRef}
                className={`${styles.googleNativeButton} ${isGoogleReady ? styles.googleNativeButtonReady : ''}`.trim()}
              />
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
