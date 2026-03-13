import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CheckoutAccessPage.module.scss';
import * as usersService from '../../utilities/users-service';

export default function CheckoutAccessPage({ setUser, user }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const isLoginDisabled = useMemo(() => {
    return !credentials.email.trim() || !credentials.password;
  }, [credentials]);

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

  if (user) {
    return (
      <main className={styles.CheckoutAccessPage}>
        <section className={styles.loggedInCard}>
          <h1>You are already logged in</h1>
          <p>Continue to complete your checkout.</p>
          <button type="button" onClick={() => navigate('/checkout')}>
            Continue to checkout
          </button>
        </section>
      </main>
    );
  }

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
        </article>
      </section>
    </main>
  );
}
