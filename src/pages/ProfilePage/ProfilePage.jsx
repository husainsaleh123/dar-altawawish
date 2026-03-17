import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, updatePassword } from '../../utilities/users-service';
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
  const [profileUser, setProfileUser] = useState(user);
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

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setLoadError('');
        const data = await getProfile();
        if (!isMounted) return;
        setProfileUser(data?.user || user);
        setOrders(Array.isArray(data?.orders) ? data.orders : []);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error.message || 'Unable to load your profile.');
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
  }, [user]);

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

    try {
      setIsUpdatingPassword(true);
      setPasswordError('');
      setPasswordSuccess('');
      const response = await updatePassword(passwordData);
      setPasswordSuccess(response?.message || 'Password updated successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(error.message || 'Unable to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
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

      <section className={styles.layout}>
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
              <label>
                <span>Current password</span>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </label>
              <label>
                <span>New password</span>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  minLength="6"
                  required
                />
              </label>
              <label>
                <span>Confirm new password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  minLength="6"
                  required
                />
              </label>
              <p className={styles.formMessageError}>{passwordError || '\u00A0'}</p>
              <p className={styles.formMessageSuccess}>{passwordSuccess || '\u00A0'}</p>
              <button type="submit" className={styles.primaryButton} disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Updating...' : 'Change password'}
              </button>
            </form>
          )}
        </article>
      </section>

      <section className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionKicker}>Past Orders</span>
            <h2>Track previous purchases</h2>
          </div>
          <Link to="/orders/new" className={styles.secondaryLink}>
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
      </section>
    </main>
  );
}
