// src/pages/AuthPage/AuthPage.jsx

import { useEffect, useState } from 'react';
import styles from './AuthPage.module.scss';
import LoginForm from '../../components/LoginForm/LoginForm';
import SignUpForm from '../../components/SignUpForm/SignUpForm';

export default function AuthPage({ setUser, initialMode = 'login' }) {
  const [showLogin, setShowLogin] = useState(initialMode !== 'signup');

  useEffect(() => {
    setShowLogin(initialMode !== 'signup');
  }, [initialMode]);

  return (
    <main className={styles.AuthPage}>
      <section className={styles.authShell}>
        <h1>{showLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p>
          {showLogin
            ? 'Log in to view your profile, points, and orders.'
            : 'Sign up in a minute with email or continue with Google.'}
        </p>

        <div className={styles.modeSwitch} role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`${styles.modeButton} ${showLogin ? styles.modeButtonActive : ''}`.trim()}
            onClick={() => setShowLogin(true)}
            aria-pressed={showLogin}
          >
            Log In
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${!showLogin ? styles.modeButtonActive : ''}`.trim()}
            onClick={() => setShowLogin(false)}
            aria-pressed={!showLogin}
          >
            Sign Up
          </button>
        </div>

        <div className={styles.authCard}>
          {showLogin ? (
            <LoginForm setUser={setUser} onSwitchToSignUp={() => setShowLogin(false)} embedded />
          ) : (
            <SignUpForm setUser={setUser} onSwitchToLogin={() => setShowLogin(true)} embedded />
          )}
        </div>
      </section>
    </main>
  );
}
