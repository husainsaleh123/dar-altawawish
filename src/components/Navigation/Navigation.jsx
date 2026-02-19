import styles from './Navigation.module.scss';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/orders/new' },
  { label: 'Contact', to: '/contact' }
];

export default function Navigation({ user }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`${styles.navbar} ${isMenuOpen ? styles.navOpen : ''}`} aria-label="Primary">
      <NavLink className={styles.brand} to="/" aria-label="Home">
        <span className={styles.brandPlaceholder} aria-hidden="true">💎</span>
      </NavLink>

      <button
        type="button"
        className={styles.menuToggle}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
        aria-controls="primary-menu"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <div id="primary-menu" className={`${styles.menuPanel} ${isMenuOpen ? styles.menuPanelOpen : ''}`}>
        <ul className={styles.links}>
          {NAV_ITEMS.map((item) => {
            const isProductsRoute = item.to === '/orders/new' && location.pathname.startsWith('/orders');
            return (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive || isProductsRoute ? styles.navLinkActive : ''}`.trim()
                  }
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          {!user && (
            <>
              <Link to="/login" className={styles.loginBtn}>
                Login
              </Link>
              <Link to="/signup" className={styles.signupBtn}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
