// src/components/LoginForm/LoginForm.jsx

import { useState } from 'react';
import * as usersService from '../../utilities/users-service';
import styles from './LoginForm.module.scss';

export default function LoginForm({ setUser, onSwitchToSignUp, embedded = false }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

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
    } catch {
      setError('Log In Failed - Try Again');
    }
  }

  return (
    <section className={`${styles.loginSection} ${embedded ? styles.embedded : ''}`.trim()}>
      <div className={styles.loginHeader}>
        <h2>Log in</h2>
        <p>Use your email address to access your account.</p>
      </div>

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
