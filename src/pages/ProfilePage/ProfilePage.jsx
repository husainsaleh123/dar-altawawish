import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getProfile,
  requestPasswordReset,
  resetPasswordWithCode,
  updatePassword
} from '../../utilities/users-service';
import styles from './ProfilePage.module.scss';

function formatDate(value) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en-BH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: 'BHD',
    maximumFractionDigits: 3
  }).format(Number(value) || 0);
}

function getStatusLabel(status) {
  return String(status || 'pending')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ProfilePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  function togglePasswordVisibility(field) {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }));
  }

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setLoadError('');
        setProfileUser(null);
        setOrders([]);
        const data = await getProfile();
        if (!isMounted) return;
        setProfileUser(data?.user || null);
        setOrders(Array.isArray(data?.orders) ? data.orders : []);
      } catch (error) {
        if (!isMounted) return;
        setProfileUser(null);
        setOrders([]);
        setLoadError(error.message || 'Unable to load your profile.');
        if (error?.status === 401 || error?.status === 404) {
          onLogout?.();
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, onLogout, user]);

  const infoRows = useMemo(() => ([
    { label: 'Name', value: profileUser?.name || 'N/A' },
    { label: 'Mobile', value: [profileUser?.countryCode, profileUser?.phone].filter(Boolean).join(' ').trim() || 'N/A' },
    { label: 'Email', value: profileUser?.email || 'N/A' },
    { label: 'Points', value: String(profileUser?.points ?? 0) }
  ]), [profileUser]);

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
    setPasswordSuccess('');
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (isForgotPasswordMode && !/^\d{4}$/.test(resetCode)) {
      setPasswordError('Enter the complete 4-digit reset code.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordError('');
      setPasswordSuccess('');
      const response = isForgotPasswordMode
        ? await resetPasswordWithCode({
            code: resetCode,
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword
          })
        : await updatePassword(passwordData);
      setPasswordSuccess(response?.message || (isForgotPasswordMode ? 'Password reset successfully.' : 'Password updated successfully.'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setResetCode('');
      setIsForgotPasswordMode(false);
    } catch (error) {
      setPasswordError(error.message || 'Unable to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function handleForgotPassword() {
    try {
      setIsRequestingReset(true);
      setPasswordError('');
      setPasswordSuccess('');
      const response = await requestPasswordReset();
      setIsForgotPasswordMode(true);
      setResetCode('');
      setPasswordData((current) => ({ ...current, currentPassword: '' }));
      setPasswordSuccess(response?.message || 'A reset code was sent to your email.');
    } catch (error) {
      setPasswordError(error?.message || 'Unable to send the reset code.');
    } finally {
      setIsRequestingReset(false);
    }
  }

  function cancelForgotPassword() {
    setIsForgotPasswordMode(false);
    setResetCode('');
    setPasswordError('');
    setPasswordSuccess('');
  }

  function handleLogoutClick() {
    onLogout?.();
    navigate('/profile');
  }

  return (
    <main className={styles.ProfilePage}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>My Profile</span>
        <h1>Account details and order activity</h1>
        <p>Review your account information, loyalty points, recent orders, and password settings.</p>
      </section>

      {loadError ? (
        <section className={styles.errorCard}>
          <h2>Profile unavailable</h2>
          <p>{loadError}</p>
        </section>
      ) : null}

      {!loadError && profileUser ? <section className={styles.layout}>
        <article className={styles.infoPanel}>
          <div className={styles.panelHeader}>
            <h2>Your information</h2>
            <div className={styles.panelActions}>
              <span>{isLoading ? 'Loading...' : 'Live account data'}</span>
              <button type="button" className={styles.logoutButton} onClick={handleLogoutClick}>
                Log out
              </button>
            </div>
          </div>

          <div className={styles.infoGrid}>
            {infoRows.map((row) => (
              <div key={row.label} className={styles.infoCard}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.passwordPanel}>
          <div className={styles.panelHeader}>
            <h2>Password</h2>
            <span>{profileUser?.authProvider === 'google' ? 'Google account' : 'Local account'}</span>
          </div>

          {profileUser?.authProvider === 'google' ? (
            <div className={styles.passwordNotice}>
              <p>Password changes are not available for accounts that sign in with Google.</p>
            </div>
          ) : (
            <form className={styles.passwordForm} onSubmit={handlePasswordSubmit}>
              {!isForgotPasswordMode ? <label>
                <span>Current password</span>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={visiblePasswords.currentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    aria-label={visiblePasswords.currentPassword ? 'Hide current password' : 'Show current password'}
                    aria-pressed={visiblePasswords.currentPassword}
                  >
                    <i className={`fa ${visiblePasswords.currentPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                  </button>
                </div>
              </label> : (
                <label>
                  <span>4-digit reset code</span>
                  <input
                    className={styles.resetCodeInput}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="4"
                    value={resetCode}
                    onChange={(event) => {
                      setResetCode(event.target.value.replace(/\D/g, '').slice(0, 4));
                      setPasswordError('');
                    }}
                    autoComplete="one-time-code"
                    required
                  />
                </label>
              )}

              <label>
                <span>New password</span>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={visiblePasswords.newPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => togglePasswordVisibility('newPassword')}
                    aria-label={visiblePasswords.newPassword ? 'Hide new password' : 'Show new password'}
                    aria-pressed={visiblePasswords.newPassword}
                  >
                    <i className={`fa ${visiblePasswords.newPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                  </button>
                </div>
              </label>
              <label>
                <span>Confirm new password</span>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={visiblePasswords.confirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    aria-label={visiblePasswords.confirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                    aria-pressed={visiblePasswords.confirmPassword}
                  >
                    <i className={`fa ${visiblePasswords.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                  </button>
                </div>
              </label>
              <p className={styles.formMessageError}>{passwordError || '\u00A0'}</p>
              <p className={styles.formMessageSuccess}>{passwordSuccess || '\u00A0'}</p>
              <div className={styles.forgotPasswordActions}>
                <button type="button" className={styles.forgotPasswordButton} onClick={handleForgotPassword} disabled={isRequestingReset}>
                  {isRequestingReset
                    ? 'Sending code...'
                    : isForgotPasswordMode
                      ? 'Resend reset code'
                      : 'Forgot current password?'}
                </button>
                {isForgotPasswordMode ? (
                  <button type="button" className={styles.cancelResetButton} onClick={cancelForgotPassword}>
                    Use current password instead
                  </button>
                ) : null}
              </div>
              <button type="submit" className={styles.primaryButton} disabled={isUpdatingPassword}>
                {isUpdatingPassword
                  ? 'Updating...'
                  : isForgotPasswordMode
                    ? 'Reset password'
                    : 'Change password'}
              </button>
            </form>
          )}
        </article>
      </section> : null}

      {!loadError && profileUser ? <section className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionKicker}>Past Orders</span>
            <h2>Track previous purchases</h2>
          </div>
          <Link to="/products" className={styles.secondaryLink}>
            Place another order
          </Link>
        </div>

        {isLoading ? <p className={styles.emptyState}>Loading orders...</p> : null}

        {!isLoading && !orders.length ? (
          <div className={styles.emptyStateCard}>
            <h3>No past orders yet</h3>
            <p>Your completed order activity will appear here once you start purchasing.</p>
          </div>
        ) : null}

        {!isLoading && orders.length ? (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <article key={order._id || order.orderNumber} className={styles.orderCard}>
                <div className={styles.orderTopRow}>
                  <div>
                    <span className={styles.metaLabel}>Order number</span>
                    <h3>{order.orderNumber}</h3>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`status${getStatusLabel(order.status).replace(/\s+/g, '')}`] || ''}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className={styles.orderMetaGrid}>
                  <div>
                    <span className={styles.metaLabel}>Date</span>
                    <strong>{formatDate(order.createdAt)}</strong>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Total</span>
                    <strong>{formatPrice(order.totalPrice)}</strong>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Fulfillment</span>
                    <strong>{getStatusLabel(order.fulfillmentMethod)}</strong>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Payment</span>
                    <strong>{getStatusLabel(order.paymentMethod)}</strong>
                  </div>
                </div>
                <div className={styles.orderActions}>
                  <Link to={`/profile/orders/${order._id}`} className={styles.orderDetailsLink}>
                    View order details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section> : null}
    </main>
  );
}
